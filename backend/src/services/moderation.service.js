import axios from "axios";
import FormData from "form-data";
import { logger } from "../utils/logger.js";
import {
  SIGHTENGINE_API_USER,
  SIGHTENGINE_API_SECRET,
} from "../config/env.config.js";

class ModerationService {
  constructor() {
    this.provider = process.env.MODERATION_PROVIDER || "sightengine";
    this.sightEngineApiUser = SIGHTENGINE_API_USER;
    this.sightEngineApiSecret = SIGHTENGINE_API_SECRET;
  }

  async moderateImage(fileBuffer, fileName = "image.jpg") {
    // Try primary provider (SightEngine)
    try {
      return await this.moderateWithSightEngine(fileBuffer, fileName);
    } catch (err) {
      logger.error("⚠️ SightEngine failed — switching to NudeNet fallback", {
        error: err.message,
      });

      // Fallback to nudenet
      try {
        return await this.moderateWithNudeNet(fileBuffer, fileName);
      } catch (fallbackErr) {
        logger.error("❌ NudeNet fallback also failed", {
          error: fallbackErr.message,
        });

        throw new Error(
          `All moderation providers failed: ${err.message}, fallback: ${fallbackErr.message}`
        );
      }
    }
  }

  async moderateWithSightEngine(fileBuffer, fileName) {
    const form = new FormData();
    form.append("media", fileBuffer, fileName); // buffer + filename
    form.append(
      "models",
      "nudity-2.1,weapon,alcohol,recreational_drug,medical,properties,type,quality,offensive-2.0,faces,people-counting,text-content,face-age,gore-2.0,text,qr-content,tobacco,genai,violence,self-harm,money,gambling"
    );
    form.append("api_user", this.sightEngineApiUser);
    form.append("api_secret", this.sightEngineApiSecret);

    try {
      logger.info("Starting SightEngine moderation", {
        fileName,
        fileSize: fileBuffer.length,
        provider: "sightengine",
      });

      const response = await axios.post(
        "https://api.sightengine.com/1.0/check.json",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
          maxContentLength: 50 * 1024 * 1024, // 50MB
          maxBodyLength: 50 * 1024 * 1024, // 50MB
        }
      );

      logger.info("SightEngine moderation completed", {
        fileName,
        status: response.status,
        hasResults: !!response.data,
      });

      return response.data;
    } catch (error) {
      logger.error("SightEngine API Error", {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fileName,
        provider: "sightengine",
      });

      // Provide more specific error messages
      if (error.code === "ECONNREFUSED") {
        throw new Error("SightEngine service is unavailable");
      } else if (error.code === "ETIMEDOUT") {
        throw new Error("SightEngine request timed out");
      } else if (error.response?.status === 401) {
        throw new Error("SightEngine authentication failed");
      } else if (error.response?.status === 429) {
        throw new Error("SightEngine rate limit exceeded");
      } else {
        throw new Error(`SightEngine moderation failed: ${error.message}`);
      }
    }
  }

  async moderateWithNudeNet(fileBuffer, fileName) {
    const form = new FormData();
    form.append("image", fileBuffer, fileName);

    try {
      logger.info("Starting NudeNet moderation", {
        fileName,
        fileSize: fileBuffer.length,
        provider: "nudenet",
      });

      const response = await axios.post(
        `${process.env.MODERATION_SERVICE_URL}/moderate`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
          maxContentLength: 50 * 1024 * 1024, // 50MB
          maxBodyLength: 50 * 1024 * 1024, // 50MB
        }
      );

      logger.info("NudeNet moderation completed", {
        fileName,
        status: response.status,
        hasResults: !!response.data,
      });

      return response.data;
    } catch (error) {
      logger.error("NudeNet API Error", {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fileName,
        provider: "nudenet",
      });

      // Provide more specific error messages
      if (error.code === "ECONNREFUSED") {
        throw new Error("NudeNet service is unavailable");
      } else if (error.code === "ETIMEDOUT") {
        throw new Error("NudeNet request timed out");
      } else if (error.response?.status === 401) {
        throw new Error("NudeNet authentication failed");
      } else if (error.response?.status === 429) {
        throw new Error("NudeNet rate limit exceeded");
      } else {
        throw new Error(`NudeNet moderation failed: ${error.message}`);
      }
    }
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
