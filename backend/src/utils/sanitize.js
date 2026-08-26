const toStr = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    if (Array.isArray(value)) {
        return value
            .map((item) =>
                typeof item === 'string' ? item : JSON.stringify(item)
            )
            .join(' ');
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
};

const toNum = (value, fallback = 0) => {
    const num = parseFloat(value);

    return Number.isNaN(num) ? fallback : num;
};

const toStrArr = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === 'string') {
                    return item.trim();
                }

                if (typeof item === 'object' && item !== null) {
                    return (
                        item.name ||
                        item.title ||
                        item.value ||
                        JSON.stringify(item)
                    );
                }

                return String(item);
            })
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return toStrArr(parsed);
            }
        } catch {
            // Ignore JSON parse errors
        }

        return [value.trim()].filter(Boolean);
    }

    return [String(value)].filter(Boolean);
};

const sanitizeExp = (experience) => {
    if (!experience || typeof experience !== 'object') {
        return null;
    }

    return {
        company: toStr(experience.company),
        role: toStr(
            experience.role ||
            experience.title ||
            experience.position ||
            ''
        ),
        duration: toStr(
            experience.duration ||
            experience.period ||
            experience.dates ||
            ''
        ),
        description: toStr(
            experience.description ||
            experience.responsibilities ||
            experience.details ||
            ''
        ),
        years: toNum(
            experience.years ||
            experience.duration_years ||
            0
        ),
    };
};

const sanitizeEdu = (education) => {
    if (!education || typeof education !== 'object') {
        return null;
    }

    return {
        institution: toStr(
            education.institution ||
            education.school ||
            education.university ||
            ''
        ),
        degree: toStr(
            education.degree ||
            education.qualification ||
            ''
        ),
        year: toStr(
            education.year ||
            education.graduation_year ||
            ''
        ),
        gpa: toStr(
            education.gpa ||
            education.grade ||
            ''
        ),
    };
};

const sanitizeProj = (project) => {
    if (!project || typeof project !== 'object') {
        return null;
    }

    return {
        name: toStr(project.name || project.title || ''),
        description: toStr(
            project.description ||
            project.summary ||
            ''
        ),
        technologies: toStrArr(
            project.technologies ||
            project.tech ||
            project.stack ||
            []
        ),
    };
};

export const sanitizeParsedData = (data) => {
    if (!data || typeof data !== 'object') {
        return {
            name: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            projects: [],
            languages: [],
            totalExperience: 0,
        };
    }

    return {
        name: toStr(data.name),
        email: toStr(data.email),
        phone: toStr(data.phone),
        location: toStr(data.location),
        summary: toStr(
            data.summary ||
            data.objective ||
            data.profile ||
            ''
        ),
        skills: toStrArr(data.skills),
        experience: Array.isArray(data.experience)
            ? data.experience
                .map(sanitizeExp)
                .filter(Boolean)
            : [],
        education: Array.isArray(data.education)
            ? data.education
                .map(sanitizeEdu)
                .filter(Boolean)
            : [],
        certifications: toStrArr(data.certifications),
        projects: Array.isArray(data.projects)
            ? data.projects
                .map(sanitizeProj)
                .filter(Boolean)
            : [],
        languages: toStrArr(data.languages),
        totalExperience: toNum(
            data.totalExperience ||
            data.total_experience ||
            0
        ),
    };
};

export const sanitizeATSResult = (data) => {
    if (!data || typeof data !== 'object') {
        return {
            score: 0,
            matchedKeywords: [],
            missingKeywords: [],
            sectionScores: {
                skills: 0,
                experience: 0,
                education: 0,
                formatting: 0,
                keywords: 0,
            },
            suggestions: [],
            summary: '',
        };
    }

    const sectionScores =
        data.sectionScores || data.section_scores || {};

    return {
        score: toNum(data.score, 0),
        matchedKeywords: toStrArr(
            data.matchedKeywords ||
            data.matched_keywords ||
            []
        ),
        missingKeywords: toStrArr(
            data.missingKeywords ||
            data.missing_keywords ||
            []
        ),
        sectionScores: {
            skills: toNum(sectionScores.skills, 0),
            experience: toNum(sectionScores.experience, 0),
            education: toNum(sectionScores.education, 0),
            formatting: toNum(sectionScores.formatting, 0),
            keywords: toNum(sectionScores.keywords, 0),
        },
        suggestions: toStrArr(data.suggestions || []),
        summary: toStr(data.summary || ''),
    };
};
