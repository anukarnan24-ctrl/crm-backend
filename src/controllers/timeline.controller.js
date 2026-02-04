import * as timelineService from "../services/timeline.service.js";

export async function contactTimeline(req, res) {
  const parsed = Number(req.params.contactId);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.contactId = parsed;
  try {
    const result = await timelineService.getContactTimeline(
      req.user,
      req.params.contactId,
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}
