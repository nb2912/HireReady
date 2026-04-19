import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { db } from '../config/firebase';

const router = Router();

// Job Application Tracker (CRUD)
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const applicationsSnapshot = await db.collection('jobApplications').where('userId', '==', req.user.uid).orderBy('timestamp', 'desc').get();
    const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error getting job applications:', error);
    res.status(500).json({ error: 'Failed to retrieve job applications.' });
  }
});

router.post('/applications', authMiddleware, async (req, res) => {
  const { companyName, jobTitle, status, applicationLink, notes } = req.body;
  if (!companyName || !jobTitle) {
    return res.status(400).send('Missing company name or job title for the application.');
  }

  try {
    const newApplication = {
      userId: req.user.uid,
      companyName,
      jobTitle,
      status: status || 'Applied',
      applicationLink,
      notes,
      timestamp: new Date(),
    };
    const docRef = await db.collection('jobApplications').add(newApplication);
    res.status(201).json({ id: docRef.id, ...newApplication });
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).json({ error: 'Failed to create job application.' });
  }
});

router.get('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const applicationDoc = await db.collection('jobApplications').doc(req.params.id).get();
    if (!applicationDoc.exists || applicationDoc.data()?.userId !== req.user.uid) {
      return res.status(404).send('Job application not found or unauthorized.');
    }
    res.status(200).json({ id: applicationDoc.id, ...applicationDoc.data() });
  } catch (error) {
    console.error('Error getting job application:', error);
    res.status(500).json({ error: 'Failed to retrieve job application.' });
  }
});

router.put('/applications/:id', authMiddleware, async (req, res) => {
  const { companyName, jobTitle, status, applicationLink, notes } = req.body;
  try {
    const applicationRef = db.collection('jobApplications').doc(req.params.id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists || applicationDoc.data()?.userId !== req.user.uid) {
      return res.status(404).send('Job application not found or unauthorized.');
    }

    await applicationRef.update({ companyName, jobTitle, status, applicationLink, notes, lastUpdated: new Date() });
    res.status(200).send('Job application updated successfully.');
  } catch (error) {
    console.error('Error updating job application:', error);
    res.status(500).json({ error: 'Failed to update job application.' });
  }
});

router.delete('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const applicationRef = db.collection('jobApplications').doc(req.params.id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists || applicationDoc.data()?.userId !== req.user.uid) {
      return res.status(404).send('Job application not found or unauthorized.');
    }

    await applicationRef.delete();
    res.status(200).send('Job application deleted successfully.');
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ error: 'Failed to delete job application.' });
  }
});

// Post-Interview Debrief Journal
router.post('/debrief-journal', authMiddleware, async (req, res) => {
  const { interviewId, notes, rating, areasForImprovement } = req.body;
  if (!interviewId || !notes) {
    return res.status(400).send('Missing interview ID or notes for debrief journal.');
  }

  try {
    const newDebrief = {
      userId: req.user.uid,
      interviewId,
      notes,
      rating,
      areasForImprovement,
      timestamp: new Date(),
    };
    const docRef = await db.collection('debriefJournals').add(newDebrief);
    res.status(201).json({ id: docRef.id, ...newDebrief });
  } catch (error) {
    console.error('Error creating debrief journal entry:', error);
    res.status(500).json({ error: 'Failed to create debrief journal entry.' });
  }
});

router.get('/debrief-journal', authMiddleware, async (req, res) => {
  try {
    const debriefsSnapshot = await db.collection('debriefJournals').where('userId', '==', req.user.uid).orderBy('timestamp', 'desc').get();
    const debriefs = debriefsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(debriefs);
  } catch (error) {
    console.error('Error getting debrief journal entries:', error);
    res.status(500).json({ error: 'Failed to retrieve debrief journal entries.' });
  }
});

export default router;