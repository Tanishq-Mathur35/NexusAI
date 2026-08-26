import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
dotenv.config();

const QUESTIONS = [
    {
        id: 'q1',
        question: 'Explain the Virtual DOM and how React uses it for performance.',
        type: 'technical',
        difficulty: 'medium',
        score: 82,
        feedback: 'Good explanation of reconciliation algorithm.',
        timeSpent: 90,
        answer: 'The Virtual DOM is a lightweight JS representation...',
        followUps: [],
        expectedTopics: ['virtual dom', 'reconciliation']
    },
    {
        id: 'q2',
        question: 'Describe a challenging project and how you handled team conflicts.',
        type: 'behavioral',
        difficulty: 'medium',
        score: 76,
        feedback: 'Strong STAR method usage.',
        timeSpent: 120,
        answer: 'At my previous company we had a critical release...',
        followUps: [],
        expectedTopics: ['leadership', 'conflict']
    },
    {
        id: 'q3',
        question: 'Difference between SQL and NoSQL? When would you use each?',
        type: 'technical',
        difficulty: 'medium',
        score: 88,
        feedback: 'Comprehensive comparison with practical examples.',
        timeSpent: 95,
        answer: 'SQL databases use structured schemas...',
        followUps: [],
        expectedTopics: ['sql', 'nosql']
    },
    {
        id: 'q4',
        question: 'How do you stay updated with new technologies?',
        type: 'hr',
        difficulty: 'easy',
        score: 70,
        feedback: 'Shows genuine curiosity.',
        timeSpent: 60,
        answer: 'I follow engineering blogs and contribute to open source...',
        followUps: [],
        expectedTopics: ['learning', 'growth']
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        await Promise.all([User.deleteMany({}), Interview.deleteMany({}), Resume.deleteMany({})]);

        const admin = await User.create({
            name: 'Admin User'
            , email: 'admin@nexus.ai',
            password: 'password123',
            role: 'admin',
            isActive: true
        });

        const demo = await User.create({
            name: 'John Doe',
            email: 'john@nexus.ai',
            password: 'password123',
            role: 'user',
            isActive: true,

            profile: {
                title: 'Senior Frontend Developer',
                bio: 'Passionate developer with 5 years experience.',
                skills: ['React', 'Node.js', 'TypeScript'],
                experience: 5,
                targetRole: 'Engineering Manager'
            },
            stats: {
                totalInterviews: 4,
                averageScore: 79,
                bestScore: 88,
                totalTime: 7200
            }
        });

        const resume = await Resume.create({
            userId: demo._id,
            fileName: 'john_doe_resume.pdf',
            fileUrl: '',
            rawText: 'John Doe | john@example.com | San Francisco\nSkills: React TypeScript Node.js MongoDB AWS Docker\nExperience: TechCorp 2021-Present Senior Frontend Developer\nEducation: UC Berkeley BS CS 2019 GPA 3.8',

            parsedData: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1 555-0100',
                location: 'San Francisco, CA',
                summary: 'Senior Frontend Developer with 5 years building scalable web apps.',
                skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
                experience: [
                    {
                        company: 'TechCorp Inc',
                        role: 'Senior Frontend Developer',
                        duration: '2021 - Present',
                        description: 'Led migration from AngularJS to React improving performance by 40%. Built real-time dashboard serving 50K daily users.',
                        years: 3
                    },
                    {
                        company: 'StartupXYZ',
                        role: 'Frontend Developer',
                        duration: '2019 - 2021',
                        description: 'Developed e-commerce platform with React and Node.js. Implemented CI/CD reducing deployment time by 60%.',
                        years: 2
                    }
                ],
                education: [{
                    institution: 'UC Berkeley',
                    degree: 'B.S. Computer Science',
                    year: '2019',
                    gpa: '3.8'
                }],
                certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
                projects: [{
                    name: 'Real-time Dashboard',
                    description: 'WebSocket-powered analytics dashboard serving 50K concurrent users.',
                    technologies: ['React', 'WebSockets', 'D3.js']
                }],
                languages: ['English', 'Spanish'], totalExperience: 5
            }
        });

        const domains = ['frontend', 'backend', 'fullstack', 'data-science'];
        for (let i = 0; i < 4; i++) {
            const score = 65 + Math.floor(Math.random() * 25);
            const startTime = new Date(Date.now() - (i + 1) * 86400000);
            await Interview.create({
                userId: demo._id,
                domain: domains[i],
                type: i % 2 === 0 ? 'technical' : 'mixed',
                difficulty: ['easy', 'medium', 'hard', 'medium'][i],
                status: 'completed',
                questions: QUESTIONS,
                transcript: [{ role: 'interviewer', content: QUESTIONS[0].question }, { role: 'candidate', content: QUESTIONS[0].answer }],
                emotionTimeline: [{ timestamp: Date.now() - 3000, emotion: 'neutral', confidence: 70 }, { timestamp: Date.now() - 1500, emotion: 'confident', confidence: 80 }],
                speechMetrics: { wordsPerMinute: 125, fillerWords: ['um', 'like'], fillerCount: 4, pauseCount: 2, totalWords: 480, sentimentScore: 0.68, clarityScore: 74 },
                scores: { technical: score, communication: score - 3, confidence: score - 6, hr: score - 2, overall: score },
                resumeId: resume._id, duration: 1200 + Math.floor(Math.random() * 600),
                report: {
                    summary: 'The candidate demonstrated solid technical knowledge and good communication skills.',
                    strengths: ['Strong technical foundation', 'Clear problem-solving', 'Good use of examples'],
                    improvements: ['Reduce filler words', 'Provide more specific metrics'],
                    recommendations: ['Practice STAR framework', 'Study system design'],
                    aiAnalysis: 'Overall a promising candidate with strong fundamentals.',
                    hirabilityScore: score + 5
                },
                startTime, endTime: new Date(startTime.getTime() + 1800000)
            });
        }

        console.log('\n✅ Seed complete!');
        console.log('   Admin:  admin@nexus.ai / password123');
        console.log('   Demo:   john@nexus.ai  / password123');
        process.exit(0);
    } catch (err) { console.error('Seed failed:', err); process.exit(1); }
};
seed();
