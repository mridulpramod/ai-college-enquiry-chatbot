export default class ChatApi {

    // =========================
    // QUERY REQUEST (USER TEXT)
    // =========================
    static async query_request(query) {
        try {
            const response = await fetch(
                `http://localhost:8000/query/${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Query API Error:", error);

            return {
                status: 400,
                message: "⚠️ Server not responding. Please check backend."
            };
        }
    }

    // =========================
    // DIRECT INTENT REQUEST
    // =========================
    static async direct_request(klass) {
        try {
            const response = await fetch(
                `http://localhost:8000/direct/${klass}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Direct API Error:", error);

            return {
                status: 400,
                message: "⚠️ Server not responding."
            };
        }
    }

    // =========================
    // 🔥 SEND ADMISSION FORM (FINAL FIXED)
    // =========================
    static async sendAdmissionForm(data) {
        try {
            // ✅ Ensure proper payload
            const payload = {
                name: data?.name || "",
                phone: data?.phone || "",
                email: data?.email || ""
            };

            console.log("📤 Sending:", payload);

            const response = await fetch(
                "http://localhost:8000/admin/save-admission",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            console.log("📥 Status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Server Error:", errorText);
                throw new Error(errorText || "Failed to submit form");
            }

            const result = await response.json();
            console.log("✅ Success:", result);

            return result;

        } catch (error) {
            console.error("🔥 Admission API Error:", error);
            throw error; // IMPORTANT
        }
    }

    // =========================
    // 🔥 GET TRAINING STATUS
    // =========================
    static async getTrainingStatus() {
        try {
            const response = await fetch(
                "http://localhost:8000/admin/training-status"
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Training Status Error:", error);

            return {
                is_training: false,
                progress: 0,
                message: "Error fetching training status"
            };
        }
    }

    // =========================
    // 🔥 RETRAIN MODEL
    // =========================
    static async retrainModel() {
        try {
            const response = await fetch(
                "http://localhost:8000/admin/retrain",
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Retrain Error:", error);

            return {
                message: "❌ Retrain failed"
            };
        }
    }

    // =========================
    // 🔥 GET ALL DATA (ADMIN)
    // =========================
    static async getFullData() {
        try {
            const response = await fetch(
                "http://localhost:8000/admin/full-data"
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Full Data Error:", error);

            return {
                intends: [],
                querys: [],
                responses: [],
                related: []
            };
        }
    }
}