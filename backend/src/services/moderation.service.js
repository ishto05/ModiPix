import axios from "axios";
import FormData from "form-data";
import fs from "fs";

class ModerationService {
  constructor() {
    this.provider = process.env.MODERATION_PROVIDER || "sightengine";
    this.sightEngineApiUser = process.env.SIGHTENGINE_API_USER;
    this.sightEngineApiSecret = process.env.SIGHTENGINE_API_SECRET;
  }

  async moderateImage(filePath) {
    switch (this.provider) {
      case "sightengine":
        return await this.moderateWithSightEngine(filePath);
      case "nudenet":
        return await this.moderateWithNudeNet(filePath);
      default:
        throw new Error(`Unsupported moderation provider: ${this.provider}`);
    }
  }

  async moderateWithSightEngine(filePath) {
    const form = new FormData();
    form.append("media", fs.createReadStream(filePath));
    form.append(
      "models",
      "nudity-2.1,weapon,alcohol,recreational_drug,medical,properties,type,quality,offensive-2.0,text-content,gore-2.0,text,qr-content,tobacco,genai,violence,self-harm,gambling"
    );
    form.append("api_user", this.sightEngineApiUser);
    form.append("api_secret", this.sightEngineApiSecret);

    try {
      const response = await axios.post(
        "https://api.sightengine.com/1.0/check.json",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
        }
      );

      return this.normalizeSightEngineResponse(response.data);
    } catch (error) {
      console.error("SightEngine API Error:", error.message);
      throw new Error("Failed to moderate image with SightEngine");
    }
  }
  async moderateWithNudeNet(filePath) {
    // Keep your existing microservice call as fallback
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    const response = await axios.post(
      `${process.env.MODERATION_SERVICE_URL}/moderate`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    return this.normalizeNudeNetResponse(response.data);
  }

  // Normalize SightEngine response to your standard schema
  normalizeSightEngineResponse(sightEngineData) {
    const moderationResult = [];

    // Helper: map score to risk level
    const getRiskLevel = (score) => {
      if (score <= 0.3) return "LOW";
      if (score <= 0.6) return "MEDIUM";
      if (score <= 0.8) return "HIGH";
      return "CRITICAL";
    };

    // Nudity
    if (sightEngineData.nudity) {
      const nudityScore = Math.max(
        sightEngineData.nudity.raw || 0,
        sightEngineData.nudity.partial || 0
      );

      if (nudityScore > 0.1) {
        moderationResult.push({
          class: "NUDITY",
          score: nudityScore,
          level: getRiskLevel(nudityScore),
        });
      }
    }

    // Weapon
    if (sightEngineData.weapon && sightEngineData.weapon > 0.3) {
      moderationResult.push({
        class: "WEAPON",
        score: sightEngineData.weapon,
        level: getRiskLevel(sightEngineData.weapon),
      });
    }

    // Gore
    if (sightEngineData.gore && sightEngineData.gore > 0.3) {
      moderationResult.push({
        class: "GORE",
        score: sightEngineData.gore,
        level: getRiskLevel(sightEngineData.gore),
      });
    }

    // Offensive
    if (sightEngineData.offensive && sightEngineData.offensive > 0.5) {
      moderationResult.push({
        class: "OFFENSIVE",
        score: sightEngineData.offensive,
        level: getRiskLevel(sightEngineData.offensive),
      });
    }

    // Alcohol
    if (sightEngineData.alcohol && sightEngineData.alcohol > 0.3) {
      moderationResult.push({
        class: "ALCOHOL",
        score: sightEngineData.alcohol,
        level: getRiskLevel(sightEngineData.alcohol),
      });
    }

    // Recreational drugs
    if (
      sightEngineData.recreational_drug &&
      sightEngineData.recreational_drug > 0.3
    ) {
      moderationResult.push({
        class: "DRUG",
        score: sightEngineData.recreational_drug,
        level: getRiskLevel(sightEngineData.recreational_drug),
      });
    }

    // Tobacco
    if (sightEngineData.tobacco && sightEngineData.tobacco > 0.3) {
      moderationResult.push({
        class: "TOBACCO",
        score: sightEngineData.tobacco,
        level: getRiskLevel(sightEngineData.tobacco),
      });
    }

    // Violence
    if (sightEngineData.violence && sightEngineData.violence > 0.3) {
      moderationResult.push({
        class: "VIOLENCE",
        score: sightEngineData.violence,
        level: getRiskLevel(sightEngineData.violence),
      });
    }

    // Self-harm
    if (sightEngineData["self-harm"] && sightEngineData["self-harm"] > 0.3) {
      moderationResult.push({
        class: "SELF_HARM",
        score: sightEngineData["self-harm"],
        level: getRiskLevel(sightEngineData["self-harm"]),
      });
    }

    // Gambling
    if (sightEngineData.gambling && sightEngineData.gambling > 0.3) {
      moderationResult.push({
        class: "GAMBLING",
        score: sightEngineData.gambling,
        level: getRiskLevel(sightEngineData.gambling),
      });
    }

    // GenAI
    if (sightEngineData.genai && sightEngineData.genai > 0.3) {
      moderationResult.push({
        class: "GENAI_CONTENT",
        score: sightEngineData.genai,
        level: getRiskLevel(sightEngineData.genai),
      });
    }

    // Attach summary if provided
    const summary = sightEngineData.summary
      ? {
          action: sightEngineData.summary.action,
          overallRisk: sightEngineData.summary.reject_prob || null,
          overallLevel: getRiskLevel(sightEngineData.summary.reject_prob || 0),
          reasons: sightEngineData.summary.reject_reason || [],
        }
      : null;

    return {
      categories: moderationResult,
      summary,
    };
  }

  normalizeNudeNetResponse(nudeNetData) {
    // Your existing NudeNet normalization
    return nudeNetData.map((item) => ({
      class: item.class,
      score: item.score,
      box: item.box,
    }));
  }
}

export default ModerationService;
