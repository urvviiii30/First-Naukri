import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParseLib = require('pdf-parse')
const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : pdfParseLib.PDFParse

import { uploadResume } from '../middleware/resumeUpload.js'
import Job from '../models/Job.js'

const router = express.Router()

const BASE_SKILLS = [
  'react',
  'javascript',
  'node.js',
  'nodejs',
  'mongodb',
  'python',
  'sql',
  'html',
  'css',
  'git',
  'rest apis',
  'rest api',
  'express',
  'next.js',
  'nextjs',
]

function normalizeSkills(rawSkills) {
  const seen = new Set()
  const cleaned = []
  for (const s of rawSkills) {
    const key = s.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      cleaned.push(s)
    }
  }
  return cleaned
}

async function extractTextFromPdf(filePath) {
  const data = await fs.readFile(filePath)
  const pdfData = await pdfParse(data)
  const text = (pdfData.text || '').toString()
  return text.toLowerCase()
}

function detectSkills(lowerText, skillsList = BASE_SKILLS) {
  const detected = []
  const missing = []

  for (const skill of skillsList) {
    const key = skill.toLowerCase()
    const simple = key.replace(/\./g, '')
    const hasSkill =
      lowerText.includes(key) ||
      (simple && lowerText.includes(simple)) ||
      (key.includes('rest api') && lowerText.includes('restful'))

    if (hasSkill) detected.push(skill)
    else missing.push(skill)
  }

  return {
    detectedSkills: normalizeSkills(detected),
    missingSkills: normalizeSkills(missing),
  }
}

function buildSuggestions(lowerText, detectedSkills, missingSkills) {
  const suggestions = []

  if (detectedSkills.length < 5) {
    suggestions.push('Add more technical skills relevant to your target roles.')
  }

  if (!lowerText.includes('project')) {
    suggestions.push('Include project descriptions that highlight how you applied your skills.')
  }

  if (!lowerText.includes('github') && !lowerText.includes('portfolio') && !lowerText.includes('linkedin')) {
    suggestions.push('Mention GitHub, portfolio, or LinkedIn links for recruiters to explore your work.')
  }

  const actionVerbs = ['developed', 'implemented', 'built', 'designed', 'led', 'optimized', 'created']
  const hasActionVerb = actionVerbs.some((v) => lowerText.includes(v))
  if (!hasActionVerb) {
    suggestions.push('Use strong action verbs like "developed", "implemented", and "optimized" in your bullet points.')
  }

  const metricsWords = ['%', 'percent', 'reduced', 'increased', 'improved', 'growth', 'savings']
  const hasMetrics = metricsWords.some((w) => lowerText.includes(w))
  if (!hasMetrics) {
    suggestions.push('Include measurable achievements such as percentages, time saved, or revenue impact.')
  }

  if (missingSkills.length > 0) {
    suggestions.push('Consider learning and adding some of the missing skills if they match your career goals.')
  }

  if (suggestions.length === 0) {
    suggestions.push('Your resume already looks strong. Fine‑tune wording and layout for better ATS readability.')
  }

  return suggestions
}

function calculateScore(detectedCount, totalCount) {
  if (!totalCount) return 0
  return Math.round((detectedCount / totalCount) * 100)
}

// POST /api/resume/analyze
router.post('/analyze', (req, res, next) => {
  uploadResume(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Failed to upload resume' })
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' })
    }

    const filePath = req.file.path

    try {
      const lowerText = await extractTextFromPdf(filePath)
      const { detectedSkills, missingSkills } = detectSkills(lowerText)
      const score = calculateScore(detectedSkills.length, BASE_SKILLS.length)
      const suggestions = buildSuggestions(lowerText, detectedSkills, missingSkills)

      return res.json({
        score,
        detectedSkills,
        missingSkills,
        suggestions,
        resumePath: path.relative(process.cwd(), filePath),
      })
    } catch (e) {
      return next(e)
    }
  })
})

// POST /api/resume/job-match
router.post('/job-match', async (req, res) => {
  try {
    const { resumeSkills, jobSkills } = req.body

    const normalizedResume = (Array.isArray(resumeSkills) ? resumeSkills : []).map((s) => s.toLowerCase())
    const normalizedJob = (Array.isArray(jobSkills) ? jobSkills : [])
      .map((s) => String(s).toLowerCase())
      .filter(Boolean)

    const matched = []
    const missing = []

    for (const skill of normalizedJob) {
      if (normalizedResume.some((r) => r.includes(skill) || skill.includes(r))) {
        matched.push(skill)
      } else {
        missing.push(skill)
      }
    }

    const score = calculateScore(matched.length, normalizedJob.length || 1)

    return res.json({
      score,
      matchedSkills: normalizeSkills(matched),
      missingSkills: normalizeSkills(missing),
    })
  } catch (e) {
    return res.status(400).json({ message: e.message || 'Failed to compare resume with job' })
  }
})

// GET /api/resume/recommend-jobs
router.get('/recommend-jobs', async (req, res) => {
  try {
    const rawSkills = req.query.skills
    const skillsArray = typeof rawSkills === 'string'
      ? rawSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(rawSkills)
        ? rawSkills
        : []

    const normalizedResume = skillsArray.map((s) => s.toLowerCase())

    const jobs = await Job.find().sort({ createdAt: -1 }).lean()

    const recommendations = jobs.map((job) => {
      const jobSkills = (job.skills || []).map((s) => String(s).toLowerCase())
      const matched = jobSkills.filter((s) =>
        normalizedResume.some((r) => r.includes(s) || s.includes(r)),
      )
      const score = calculateScore(matched.length, jobSkills.length || 1)

      return {
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        skills: job.skills,
        matchScore: score,
        matchedSkills: normalizeSkills(matched),
      }
    })

    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    return res.json(recommendations)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to recommend jobs' })
  }
})

export default router

