import { useState, useEffect, useRef } from 'react'
import { getUserProfile } from './api/client'
import BackButton from './components/BackButton'
import './ResumeBuilder.css'

const EMPTY_EDU = { institution: '', degree: '', year: '' }
const EMPTY_EXP = { company: '', role: '', duration: '', description: '' }
const EMPTY_PROJ = { title: '', description: '', techStack: '', link: '' }
const EMPTY_CERT = { title: '', issuer: '', date: '' }

// ─── Extracted components (stable references, no remounting) ─────────────

function ChevronDown({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function Section({ id, icon, title, isOpen, onToggle, children }) {
  return (
    <div className="rb-section">
      <div className="rb-section-header" onClick={() => onToggle(id)}>
        <div className="rb-section-header-left">
          <div className="rb-section-icon">{icon}</div>
          <h3>{title}</h3>
        </div>
        <ChevronDown className={`rb-section-toggle ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && <div className="rb-section-body">{children}</div>}
    </div>
  )
}

function ResumePreview({ template, personal, objective, education, experience, projects, skills, certifications, links }) {
  const cls = template === 'modern' ? 'resume-modern' : 'resume-professional'

  const hasEducation = education.some((e) => e.institution || e.degree)
  const hasExperience = experience.some((e) => e.company || e.role)
  const hasProjects = projects.some((p) => p.title)
  const hasCertifications = certifications.some((c) => c.title)
  const hasLinks = links.github || links.linkedin

  return (
    <div className={cls}>
      {/* Header */}
      <div className="resume-header">
        <h1 className="resume-name">{personal.name || 'Your Name'}</h1>
        <div className="resume-contact">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </div>

      {/* Objective */}
      {objective && (
        <div className="resume-section">
          <h2 className="resume-section-title">Objective</h2>
          <p className="resume-objective">{objective}</p>
        </div>
      )}

      {/* Education */}
      {hasEducation && (
        <div className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.filter((e) => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <p className="resume-entry-title">{edu.institution}</p>
                  <p className="resume-entry-subtitle">{edu.degree}</p>
                </div>
                {edu.year && <span className="resume-entry-date">{edu.year}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {experience.filter((e) => e.company || e.role).map((exp, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <p className="resume-entry-title">{exp.role}</p>
                  <p className="resume-entry-subtitle">{exp.company}</p>
                </div>
                {exp.duration && <span className="resume-entry-date">{exp.duration}</span>}
              </div>
              {exp.description && <p className="resume-entry-desc">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {hasProjects && (
        <div className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.filter((p) => p.title).map((proj, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <p className="resume-entry-title">{proj.title}</p>
                {proj.techStack && <span className="resume-entry-date">{proj.techStack}</span>}
              </div>
              {proj.description && <p className="resume-entry-desc">{proj.description}</p>}
              {proj.link && (
                <p className="resume-entry-desc" style={{ fontSize: '0.625rem', color: '#2563eb' }}>
                  {proj.link}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <div className="resume-skills-list">
            {skills.map((s, i) => (
              <span key={i} className="resume-skill-chip">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {hasCertifications && (
        <div className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.filter((c) => c.title).map((cert, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <p className="resume-entry-title">{cert.title}</p>
                  {cert.issuer && <p className="resume-entry-subtitle">{cert.issuer}</p>}
                </div>
                {cert.date && <span className="resume-entry-date">{cert.date}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      {hasLinks && (
        <div className="resume-section">
          <h2 className="resume-section-title">Links</h2>
          <div className="resume-links">
            {links.github && <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>}
            {links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function ResumeBuilder() {
  // Template
  const [template, setTemplate] = useState('professional')

  // Section open/close
  const [openSections, setOpenSections] = useState({
    personal: true,
    objective: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    certifications: false,
    links: false,
  })

  // Form data
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '' })
  const [objective, setObjective] = useState('')
  const [education, setEducation] = useState([{ ...EMPTY_EDU }])
  const [experience, setExperience] = useState([{ ...EMPTY_EXP }])
  const [projects, setProjects] = useState([{ ...EMPTY_PROJ }])
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [certifications, setCertifications] = useState([{ ...EMPTY_CERT }])
  const [links, setLinks] = useState({ github: '', linkedin: '' })

  const [loading, setLoading] = useState(true)
  const previewRef = useRef(null)

  // Auto-fill from profile
  useEffect(() => {
    getUserProfile()
      .then((u) => {
        setPersonal({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          location: u.location || '',
        })
        if (u.bio) setObjective(u.bio)
        if (u.education?.length) {
          setEducation(u.education.map((e) => ({
            institution: e.institution || '',
            degree: e.degree || '',
            year: e.year || '',
          })))
        }
        if (u.projects?.length) {
          setProjects(u.projects.map((p) => ({
            title: p.title || '',
            description: p.description || '',
            techStack: p.techStack || '',
            link: p.link || '',
          })))
        }
        if (u.skills?.length) setSkills(u.skills)
        if (u.certifications?.length) {
          setCertifications(u.certifications.map((c) => ({
            title: c.title || '',
            issuer: c.issuer || '',
            date: c.date || '',
          })))
        }
        if (u.socialLinks) {
          setLinks({
            github: u.socialLinks.github || '',
            linkedin: u.socialLinks.linkedin || '',
          })
        }
      })
      .catch((err) => console.error('Failed loading profile for resume:', err))
      .finally(() => setLoading(false))
  }, [])

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Multi-entry helpers
  function updateEntry(setter, idx, field, value) {
    setter((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }
  function addEntry(setter, tmpl) {
    setter((prev) => [...prev, { ...tmpl }])
  }
  function removeEntry(setter, idx) {
    setter((prev) => prev.filter((_, i) => i !== idx))
  }

  // Skills
  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
    }
    setSkillInput('')
  }
  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }
  function handleSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  // Download PDF
  function handleDownload() {
    window.print()
  }

  if (loading) {
    return (
      <div className="rb-page">
        <div className="rb-page-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ color: '#64748b', fontWeight: 700 }}>Loading your profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rb-page">
      <div className="rb-page-inner">
        <div style={{ marginBottom: '0.5rem' }}><BackButton /></div>

        <div className="rb-header">
          <h1>Create Your Resume</h1>
          <p>Fill in your details and watch your resume come to life in real time.</p>
        </div>

        {/* Toolbar */}
        <div className="rb-toolbar">
          <div className="rb-template-switcher">
            <span>Template:</span>
            <button
              className={`rb-template-btn ${template === 'professional' ? 'active' : ''}`}
              onClick={() => setTemplate('professional')}
            >
              Professional
            </button>
            <button
              className={`rb-template-btn ${template === 'modern' ? 'active' : ''}`}
              onClick={() => setTemplate('modern')}
            >
              Modern
            </button>
          </div>
          <button className="rb-download-btn" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Two panels */}
        <div className="rb-panels">
          {/* LEFT: Form Editor */}
          <div className="rb-form-panel">

            {/* Personal Info */}
            <Section id="personal" icon="👤" title="Personal Information" isOpen={openSections.personal} onToggle={toggleSection}>
              <div className="rb-row">
                <div className="rb-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={personal.name}
                    onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="rb-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={personal.email}
                    onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="rb-row">
                <div className="rb-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={personal.phone}
                    onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="rb-field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={personal.location}
                    onChange={(e) => setPersonal((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Bangalore, India"
                  />
                </div>
              </div>
            </Section>

            {/* Objective */}
            <Section id="objective" icon="🎯" title="Career Objective" isOpen={openSections.objective} onToggle={toggleSection}>
              <div className="rb-field full">
                <label>Objective / Summary</label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="A brief summary of your career goals and what you bring to the table..."
                  rows={3}
                />
              </div>
            </Section>

            {/* Education */}
            <Section id="education" icon="🎓" title="Education" isOpen={openSections.education} onToggle={toggleSection}>
              {education.map((edu, idx) => (
                <div key={idx} className="rb-entry-card">
                  {education.length > 1 && (
                    <button className="rb-remove-entry" onClick={() => removeEntry(setEducation, idx)} title="Remove">×</button>
                  )}
                  <div className="rb-row">
                    <div className="rb-field">
                      <label>Institution</label>
                      <input
                        value={edu.institution}
                        onChange={(e) => updateEntry(setEducation, idx, 'institution', e.target.value)}
                        placeholder="University / College"
                      />
                    </div>
                    <div className="rb-field">
                      <label>Degree / Course</label>
                      <input
                        value={edu.degree}
                        onChange={(e) => updateEntry(setEducation, idx, 'degree', e.target.value)}
                        placeholder="B.Tech Computer Science"
                      />
                    </div>
                  </div>
                  <div className="rb-row" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="rb-field">
                      <label>Year</label>
                      <input
                        value={edu.year}
                        onChange={(e) => updateEntry(setEducation, idx, 'year', e.target.value)}
                        placeholder="2021 - 2025"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="rb-add-entry" onClick={() => addEntry(setEducation, EMPTY_EDU)}>+ Add Education</button>
            </Section>

            {/* Experience */}
            <Section id="experience" icon="💼" title="Experience" isOpen={openSections.experience} onToggle={toggleSection}>
              {experience.map((exp, idx) => (
                <div key={idx} className="rb-entry-card">
                  {experience.length > 1 && (
                    <button className="rb-remove-entry" onClick={() => removeEntry(setExperience, idx)} title="Remove">×</button>
                  )}
                  <div className="rb-row">
                    <div className="rb-field">
                      <label>Company</label>
                      <input
                        value={exp.company}
                        onChange={(e) => updateEntry(setExperience, idx, 'company', e.target.value)}
                        placeholder="Google"
                      />
                    </div>
                    <div className="rb-field">
                      <label>Role</label>
                      <input
                        value={exp.role}
                        onChange={(e) => updateEntry(setExperience, idx, 'role', e.target.value)}
                        placeholder="Software Engineer Intern"
                      />
                    </div>
                  </div>
                  <div className="rb-row" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="rb-field">
                      <label>Duration</label>
                      <input
                        value={exp.duration}
                        onChange={(e) => updateEntry(setExperience, idx, 'duration', e.target.value)}
                        placeholder="Jun 2024 - Aug 2024"
                      />
                    </div>
                  </div>
                  <div className="rb-field full">
                    <label>Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateEntry(setExperience, idx, 'description', e.target.value)}
                      placeholder="Key responsibilities and achievements..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button className="rb-add-entry" onClick={() => addEntry(setExperience, EMPTY_EXP)}>+ Add Experience</button>
            </Section>

            {/* Projects */}
            <Section id="projects" icon="🚀" title="Projects" isOpen={openSections.projects} onToggle={toggleSection}>
              {projects.map((proj, idx) => (
                <div key={idx} className="rb-entry-card">
                  {projects.length > 1 && (
                    <button className="rb-remove-entry" onClick={() => removeEntry(setProjects, idx)} title="Remove">×</button>
                  )}
                  <div className="rb-row">
                    <div className="rb-field">
                      <label>Project Title</label>
                      <input
                        value={proj.title}
                        onChange={(e) => updateEntry(setProjects, idx, 'title', e.target.value)}
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="rb-field">
                      <label>Tech Stack</label>
                      <input
                        value={proj.techStack}
                        onChange={(e) => updateEntry(setProjects, idx, 'techStack', e.target.value)}
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                  <div className="rb-field full">
                    <label>Description</label>
                    <textarea
                      value={proj.description}
                      onChange={(e) => updateEntry(setProjects, idx, 'description', e.target.value)}
                      placeholder="Brief description of the project..."
                      rows={2}
                    />
                  </div>
                  <div className="rb-field full">
                    <label>Link (optional)</label>
                    <input
                      value={proj.link}
                      onChange={(e) => updateEntry(setProjects, idx, 'link', e.target.value)}
                      placeholder="https://github.com/you/project"
                    />
                  </div>
                </div>
              ))}
              <button className="rb-add-entry" onClick={() => addEntry(setProjects, EMPTY_PROJ)}>+ Add Project</button>
            </Section>

            {/* Skills */}
            <Section id="skills" icon="⚡" title="Skills" isOpen={openSections.skills} onToggle={toggleSection}>
              <div className="rb-field full">
                <label>Add Skills (press Enter or comma)</label>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter..."
                />
              </div>
              {skills.length > 0 && (
                <div className="rb-skills-display">
                  {skills.map((skill, i) => (
                    <span key={i} className="rb-skill-tag">
                      {skill}
                      <button onClick={() => removeSkill(skill)} title="Remove">×</button>
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Certifications */}
            <Section id="certifications" icon="📜" title="Certifications" isOpen={openSections.certifications} onToggle={toggleSection}>
              {certifications.map((cert, idx) => (
                <div key={idx} className="rb-entry-card">
                  {certifications.length > 1 && (
                    <button className="rb-remove-entry" onClick={() => removeEntry(setCertifications, idx)} title="Remove">×</button>
                  )}
                  <div className="rb-row">
                    <div className="rb-field">
                      <label>Title</label>
                      <input
                        value={cert.title}
                        onChange={(e) => updateEntry(setCertifications, idx, 'title', e.target.value)}
                        placeholder="AWS Cloud Practitioner"
                      />
                    </div>
                    <div className="rb-field">
                      <label>Issuer</label>
                      <input
                        value={cert.issuer}
                        onChange={(e) => updateEntry(setCertifications, idx, 'issuer', e.target.value)}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                  </div>
                  <div className="rb-row" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="rb-field">
                      <label>Date</label>
                      <input
                        value={cert.date}
                        onChange={(e) => updateEntry(setCertifications, idx, 'date', e.target.value)}
                        placeholder="Dec 2024"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="rb-add-entry" onClick={() => addEntry(setCertifications, EMPTY_CERT)}>+ Add Certification</button>
            </Section>

            {/* Social Links */}
            <Section id="links" icon="🔗" title="Social Links" isOpen={openSections.links} onToggle={toggleSection}>
              <div className="rb-row">
                <div className="rb-field">
                  <label>GitHub URL</label>
                  <input
                    value={links.github}
                    onChange={(e) => setLinks((l) => ({ ...l, github: e.target.value }))}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div className="rb-field">
                  <label>LinkedIn URL</label>
                  <input
                    value={links.linkedin}
                    onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
              </div>
            </Section>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="rb-preview-panel">
            <div className="rb-preview-frame">
              <div className="rb-preview-label">Live Preview</div>
              <div className="rb-preview-content" ref={previewRef}>
                <ResumePreview
                  template={template}
                  personal={personal}
                  objective={objective}
                  education={education}
                  experience={experience}
                  projects={projects}
                  skills={skills}
                  certifications={certifications}
                  links={links}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
