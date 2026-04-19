import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { db } from '../config/firebase';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper function to interact with Gemini
async function generateContent(prompt: string) {
  try {
    const result = await model.generateContent(prompt, generationConfig, safetySettings);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw new Error('Failed to generate content from AI.');
  }
}

// AI Answer Feedback route (via Gemini)
router.post('/feedback', authMiddleware, async (req, res) => {
  const { interviewContext, userAnswer } = req.body;
  if (!interviewContext || !userAnswer) {
    return res.status(400).send('Missing interviewContext or userAnswer.');
  }

  try {
    const prompt = `Given the interview context: "${interviewContext}" and the user's answer: "${userAnswer}", provide constructive feedback on the answer. Focus on clarity, completeness, relevance, and areas for improvement.`;
    const feedback = await generateContent(prompt);

    // Store feedback in Firestore
    await db.collection('feedback').add({
      userId: req.user.uid, // Assuming req.user is populated by authMiddleware
      interviewContext,
      userAnswer,
      feedback,
      timestamp: new Date(),
    });

    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// AI Mock Interviewer route (via Gemini)
router.post('/mock-interview', authMiddleware, async (req, res) => {
  const { role, previousQuestions, userResponses } = req.body;
  if (!role) {
    return res.status(400).send('Missing interview role.');
  }

  try {
    let prompt = `You are an AI mock interviewer for a ${role} position. Ask a relevant interview question.`;
    if (previousQuestions && previousQuestions.length > 0) {
      prompt += `

Previous questions asked: ${previousQuestions.join('\n')}`;
      prompt += `

User's previous responses: ${userResponses.join('\n')}`;
      prompt += `

Based on the above, ask the next question.`;
    }

    const question = await generateContent(prompt);

    // Store mock interview session in Firestore
    await db.collection('mockInterviews').add({
      userId: req.user.uid,
      role,
      question,
      timestamp: new Date(),
    });

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Resume Analyzer route (via Gemini)
router.post('/resume-analyzer', authMiddleware, async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText) {
    return res.status(400).send('Missing resume text.');
  }

  try {
    let prompt = `Analyze the following resume and provide constructive feedback on its strengths, weaknesses, and suggestions for improvement.`;
    if (jobDescription) {
      prompt += ` Focus on how well it aligns with this job description: "${jobDescription}".`;
    }
    prompt += `

Resume:
"""
${resumeText}
"""`;

    const analysis = await generateContent(prompt);

    // Store resume analysis in Firestore
    await db.collection('resumeAnalysis').add({
      userId: req.user.uid,
      resumeText,
      jobDescription,
      analysis,
      timestamp: new Date(),
    });

    res.status(200).json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Company Research Tool route (via Gemini)
router.post('/company-research', authMiddleware, async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.status(400).send('Missing company name.');
  }

  try {
    const prompt = `Provide key information about ${companyName}, including its industry, recent news, common interview questions, and company culture.`;
    const research = await generateContent(prompt);

    // Store research in Firestore
    await db.collection('companyResearch').add({
      userId: req.user.uid,
      companyName,
      research,
      timestamp: new Date(),
    });

    res.status(200).json({ research });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Thank You Note Generator route (via Gemini)
router.post('/thank-you-note', authMiddleware, async (req, res) => {
  const { interviewDetails, interviewerName, userStrengths } = req.body;
  if (!interviewDetails || !interviewerName) {
    return res.status(400).send('Missing interview details or interviewer name.');
  }

  try {
    let prompt = `Generate a professional thank you note for an interviewer named ${interviewerName} after an interview for the following details: "${interviewDetails}".`;
    if (userStrengths) {
      prompt += ` Highlight the user's strengths: "${userStrengths}".`;
    }
    const thankYouNote = await generateContent(prompt);

    // Store thank you note in Firestore
    await db.collection('thankYouNotes').add({
      userId: req.user.uid,
      interviewDetails,
      interviewerName,
      userStrengths,
      thankYouNote,
      timestamp: new Date(),
    });

    res.status(200).json({ thankYouNote });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Temporary Firestore Test Route - Keep for now
router.get('/test-firestore', authMiddleware, async (req, res) => {
  try {
    const testDocRef = db.collection('testCollection').doc('testDocument');
    const dataToWrite = {
      message: 'Hello from Firebase!',
      timestamp: new Date().toISOString()
    };

    await testDocRef.set(dataToWrite);
    console.log('Test document written to Firestore.');

    const doc = await testDocRef.get();
    if (doc.exists) {
      console.log('Test document read from Firestore:', doc.data());
      res.status(200).json({
        message: 'Firestore connection successful!',
        writtenData: dataToWrite,
        readData: doc.data()
      });
    } else {
      res.status(404).send('Test document not found after writing.');
    }
  } catch (error) {
    console.error('Error testing Firestore:', error);
    res.status(500).json({
      message: 'Error connecting to Firestore.',
      error: error instanceof Error ? error.message : 'An unknown error occurred.'
    });
  }
});

export default router;