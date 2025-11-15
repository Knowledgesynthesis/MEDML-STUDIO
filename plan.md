# **MEDML STUDIO — OPTIMIZED MASTER PROMPT FOR EDUCATIONAL APP GENERATION**  
A clinically rigorous, safety-first, evidence-based master prompt for generating a **mobile-first, offline-capable, dark-mode educational app** that teaches clinicians how interpretable machine learning (ML) models work in the context of clinical decision support — with a relentless focus on explainability, uncertainty, bias, and ethical implications.

---

# **MASTER PROMPT — MedML Studio Educational App Generator (SPECIALIZED VERSION)**

## **Role & Mission**
You are a cross-functional team (PM + Staff Engineer + Senior Instructional Designer + Clinical ML SME + Evidence-Based Medicine SME + Ethics/Regulation SME + UX Writer + QA).  
Your mission is to design an **interactive ML interpretation platform** that teaches:

**MedML Studio: Interpretable Machine Learning for Clinical Decision Support**  
—A safe, transparent, educational environment where clinicians explore ML models, compare their behaviors, understand their limitations, and critically judge when (or whether) to trust their predictions.

This app must:
- Support **all learner levels:** MS2 → MS4 → residents → fellows → attendings → clinical researchers  
- Cover **ML for clinical decision support (CDS)** with rigorous conceptual clarity  
- Maintain **scientific and regulatory accuracy**, avoiding impossible ML behaviors or hallucinated mechanisms  
- Use **synthetic datasets only** (e.g., simulated EHR/lab values)  
- Offer **interactive and static visualizations** of model internals, variable importance, decision boundaries, calibration, and uncertainty  
- Be mobile-first, offline-ready, and designed with explainability-first pedagogy  
- Emphasize **ethical reasoning, fairness, transparency, and clinical appropriateness**  

Your output must be **evidence-based, coherent, and aligned with AI-in-healthcare best practices** (AMA, FDA, EU AI Act principles, etc.).

---

## **Inputs (Fill These)**
- **Primary Topic(s):**  
  Always centered on **interpretable ML for clinical decision support**, including:  
  - Logistic regression, decision trees, random forests, gradient boosting, simple neural nets  
  - Data preprocessing (synthetic EHR/lab datasets)  
  - Explainability tools (global & local):  
    - Feature importance  
    - Partial Dependence  
    - SHAP  
    - LIME  
  - Decision boundaries  
  - Uncertainty visualization  
  - Calibration curves  
  - Bias, fairness, transparency  
  - Clinical trust frameworks  
  - Ethical & regulatory considerations  
- **Target Learner Levels:** {{LEVELS}}  
  - e.g., “Clinicians, residents, informatics fellows, CDS stakeholders”
- **Learner Context:** {{CONTEXT}}  
  - e.g., “Understand ML for CDS, audit interpretability, evaluate model reliability”
- **Learning Outcomes (SMART + Bloom):** {{LEARNING_OBJECTIVES}}  
  - e.g., “Interpret model outputs; compare models; analyze uncertainty and calibration; identify bias; decide whether a model is clinically trustworthy”
- **Constraints/Preferences:**  
  Always include:  
  - *Mobile-first; dark mode; offline-ready; synthetic datasets only; no true patient-level predictions; conceptual ML only*  
- **References/Standards:** {{REFERENCES}}  
  - e.g., “FDA SaMD, AMA AI guidelines, EU AI Act principles, PROBAST-AI”
- **Brand/Voice:** {{VOICE_TONE}}  
  - e.g., “Clinical, intuitive, transparent, ethically rigorous”
- **Localization/Regional Regulation:** {{LOCALE}}

---

# **Required Deliverables (Produce All)**

---

## **1. Executive Summary**
- Describe clinicians’ difficulty understanding ML behavior, trustworthiness, and clinical relevance.  
- Introduce MedML Studio as the **Interpretable ML Sandbox + Clinical Trust Lab + Ethical Reasoning Engine**.  
- Provide 2–3 possible name alternatives + crisp value propositions.

---

## **2. Learner Personas & Use Cases**
Examples:
- Resident interpreting an ML-based readmission risk score  
- Fellow evaluating CDS suggestions in EMR  
- Attending clinician assessing fairness of a risk prediction model  
- Researcher comparing model architectures for a clinical outcome  
Use cases: journal club, CDS evaluation, model audit, ethics rounds.

---

## **3. Curriculum Map & Knowledge Graph**
Everything must connect **ML ↔ Explainability ↔ EBM ↔ CDS ↔ Ethics**.

### **Prerequisites**
- Variable types  
- Basic regression & risk measures  
- Sensitivity, specificity, ROC curves  
- Intro to ML general concepts  

### **Modules**
1. **Foundations of ML in Healthcare**  
   - What ML can/cannot do in clinical contexts  
   - Prediction vs causation in medicine  
   - CDS categories & regulatory oversight  

2. **Data Foundations**  
   - Synthetic EHR/lab datasets  
   - Preprocessing, missingness  
   - Feature engineering  

3. **Baseline Interpretable Models**  
   - Logistic regression  
   - Decision trees  
   - Model assumptions & limitations  

4. **Ensemble Models**  
   - Random forests  
   - Gradient boosting  
   - Tradeoffs: accuracy vs interpretability  

5. **Neural Networks (Clinically Relevant Overview)**  
   - Basic architecture  
   - When neural nets are appropriate or inappropriate  
   - Interpretability concerns  

6. **Explainability Tools**  
   - Feature importance  
   - Partial dependence & ICE  
   - SHAP values  
   - LIME  
   - Local vs global interpretations  

7. **Uncertainty & Calibration**  
   - Confidence vs probability  
   - Calibration curves  
   - Overconfidence risks in CDS  

8. **Model Comparison & Trust**  
   - Decision boundaries  
   - ROC + calibration side-by-side  
   - “Would you trust this model?” overlay  

9. **Bias, Fairness & Ethical Use**  
   - Bias detection  
   - Sampling bias  
   - Fairness metrics  
   - Risk of harm  
   - Accountability & transparency principles  

10. **Integrated Model Evaluation Sandbox**  
   - Load synthetic dataset → train model → interpret → compare → judge trustworthiness  

Each module: micro-concepts, prerequisites, Bloom tags, cross-links.

---

## **4. Interactives (MedML Studio–Specific)**

### **Examples**
- **Drag-and-Drop Synthetic Dataset Loader**  
  - Users load EHR/lab-based synthetic datasets  
  - Visual preview of distributions  

- **Model Comparison Playground**  
  - Logistic regression vs tree vs random forest vs boosted model  
  - Visualize changes in boundaries, calibration, variable importance  

- **Decision Boundary Explorer**  
  - Interactive 2D feature space with adjustable parameters  

- **Feature Importance Dashboard**  
  - Bar charts, permutation importance, SHAP global explanations  

- **Local Explanation Explorer (LIME/SHAP)**  
  - Pick a synthetic patient → see local contributions  
  - “What drove this prediction?”  

- **Uncertainty & Calibration Lab**  
  - Toggle thresholds → see effect on classification & risk curves  

- **Ethical Audit Simulator**  
  - Identify potential sources of bias  
  - Evaluate fairness metrics  
  - Annotate flawed design choices  

- **Clinical Trust Case Overlay**  
  - Vignette + model output + explanations  
  - User decides: “Trust? Not trust? Why?”  

For each interactive:
- purpose  
- inputs  
- outputs  
- visualization  
- preset synthetic scenarios  
- safety guardrails (no real CDS)

---

## **5. Assessment & Mastery**
Item types:
- Interpret feature importance  
- Identify overfitting from decision boundaries  
- Evaluate calibration & uncertainty  
- Judge whether a model is trustworthy  
- Bias/fairness scenario analysis  
- Explain SHAP/LIME outputs  
Provide **10–20 items** with rationales.

---

## **6. ML Reasoning Framework for Clinicians**
Teach stepwise reasoning:
1. Define prediction context & need  
2. Understand data structure and limitations  
3. Choose model appropriately  
4. Examine global & local explanations  
5. Check calibration and uncertainty  
6. Evaluate fairness and ethical risks  
7. Consider clinical actionability  
8. Decide trustworthiness  

Pitfalls:
- Confusing correlation with causation  
- Misinterpreting SHAP as causal  
- Overtrusting accuracy without calibration  
- Ignoring bias  
- Treating ML output as clinical truth  

---

## **7. Accessibility & Safety**
- WCAG 2.2 AA  
- Synthetic data only  
- No clinical predictions for real patients  
- Clear safety disclaimers  
- Ensure explainability tools match known theoretical behavior  
- Align with FDA/CLIA/AMA ethical guardrails  

---

## **8. Tech Architecture (Mobile-First, Offline)**
- React/TypeScript  
- Tailwind + shadcn/ui  
- Recharts/D3 for SHAP/calibration/boundary plots  
- IndexedDB + Service Worker for offline functionality  
- Lightweight JS simulation for model training  
- Zustand/Redux for state  

---

## **9. Data Schemas (JSON)**
Schemas for:
- synthetic datasets  
- feature metadata  
- model definitions  
- performance metrics  
- SHAP/LIME structures  
- calibration outputs  
- fairness/bias indicators  
- clinical case overlays  
- glossary terms  

Include representative examples.

---

## **10. Screen Specs & Text Wireframes**
Screens:
- Home  
- Dataset Loader  
- Model Builder  
- Comparison Playground  
- Feature Importance Lab  
- LIME/SHAP Explorer  
- Calibration & Uncertainty Lab  
- Ethics & Bias Center  
- Clinical Trust Case Engine  
- Assessment Hub  
- Glossary  
- Settings  

Provide textual wireframes.

---

## **11. Copy & Content Kit**
Include:
- Microcopy (“What SHAP means”, “Calibration matters”, “Decision boundaries explained”)  
- Glossary definitions  
- Diagram labels  
- Two full lessons + one integrated clinical trust case  

---

## **12. Analytics & A/B Plan**
UI-only experiments:
- SHAP visualization styles  
- Boundary slider interactions  
- Calibration plot layouts  
No statistical or clinical A/B tests.

---

## **13. QA Checklist**
- ML logic cross-checked  
- SHAP & LIME descriptions accurate  
- No exaggerated claims of AI capability  
- Calibration definitions correct  
- Ethical guidance consistent with modern standards  
- Internal consistency across modules  

---

## **14. Roadmap**
Prototype → Pilot → Explainability Expansion → Bias/Fairness Deep Dive → Personalized Learning Pathways  
Include acceptance criteria & risks.

---

# **Style & Rigor Requirements**
- Intuitive, visual, clinically grounded  
- Emphasize transparency & accountability  
- No hallucinated ML mechanisms  
- Evidence-based & regulation-consistent  
- Pathoma-like clarity but for ML interpretability  

---

# **Acceptance Criteria**
- Learner can read, critique, and interpret ML models for CDS  
- All content is explainable, trustworthy, and accurate  
- No contradictions across modules  
- MedML Studio reinforces a unified **Interpretable Clinical ML Systems Map**

---

# **Now Generate**
Using the inputs above, produce all deliverables in the required order.  
If inputs are missing, make ML/clinical-sound assumptions and label them as defaults.
