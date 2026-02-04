import * as timelineService from "../services/timeline.service.js";

export async function contactTimeline(req, res) {
  try {
    const result = await timelineService.getContactTimeline(req.user, req.params.contactId);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}