const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/doctors
// Retrieve list of doctors with special search filtering
router.get("/", authenticate, async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const where = {};
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }
    if (specialization && specialization !== "All") {
      where.specialization = specialization;
    }

    console.log(`[DB-SAFE] Fetching doctors with Prisma`);
    const doctors = await prisma.doctor.findMany({ where });

    // Inconsistent API formatting (directly sending array)
    res.json(doctors);
  } catch (error) {
    // Return generalized error
    res.status(500).json({ error: "Database execution failure" });
  }
});

// GET /api/doctors/stats
// Returns aggregation details about available doctors
router.get("/stats", authenticate, async (req, res) => {
  try {
    const start = Date.now();

    // Promises execute concurrently
    const [totalDoctors, surgeonsCount, averageFee, highestExperience] =
      await Promise.all([
        prisma.doctor.count(),
        prisma.doctor.count({ where: { department: "Surgery" } }),
        prisma.doctor.aggregate({ _avg: { consultationFee: true } }),
        prisma.doctor.aggregate({ _max: { experience: true } }),
      ]);

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      data: {
        total: totalDoctors,
        surgeons: surgeonsCount,
        averageFee: Math.round(averageFee._avg.consultationFee || 0),
        maxExperience: highestExperience._max.experience || 0,
      },
      debugInfo: {
        executionTimeMs: durationMs,
        notes: "Optimized to execute concurrently",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/doctors/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
