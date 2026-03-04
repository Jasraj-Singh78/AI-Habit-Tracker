const StudySession = require('../models/StudySession');

// POST /api/study-sessions
const createStudySession = async (req, res, next) => {
  try {
    const { subject, duration, date } = req.body;

    if (!subject || !duration) {
      return res.status(400).json({ message: 'Subject and duration are required' });
    }

    const session = await StudySession.create({
      user: req.user._id,
      subject,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// GET /api/study-sessions
// Optional query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
const getStudySessions = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user._id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const sessions = await StudySession.find(filter).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/study-sessions/:id
const deleteStudySession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    await session.deleteOne();
    res.json({ message: 'Study session removed' });
  } catch (error) {
    next(error);
  }
};

// GET /api/study-sessions/report (CSV)
const getStudyReport = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id }).sort({
      date: 1,
    });

    const header = 'Date,Subject,Duration (minutes)\n';
    const rows = sessions
      .map((s) => {
        const date = s.date.toISOString().split('T')[0];
        return `${date},${s.subject},${s.duration}`;
      })
      .join('\n');

    const csv = header + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="study_report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudySession,
  getStudySessions,
  deleteStudySession,
  getStudyReport,
};

