import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, CheckCircle2, TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  institution: string;
  modelType: string;
  outcome: 'success' | 'mixed' | 'cautionary';
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  keyLessons: string[];
}

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Sepsis Early Warning System',
    institution: 'Johns Hopkins Hospital (Educational Example)',
    modelType: 'Gradient Boosting Machine',
    outcome: 'success',
    summary: 'Implementation of an ML-based sepsis prediction model to identify at-risk patients 6-12 hours before clinical deterioration.',
    challenge: 'Traditional sepsis screening relied on rigid criteria (SIRS, qSOFA) that missed early cases or generated too many false alarms. Clinicians needed earlier, more accurate warnings without overwhelming alert fatigue.',
    solution: 'Deployed a gradient boosting model trained on vital signs, lab values, and demographics from 50,000+ ICU patients. The model generated risk scores every hour, with alerts triggered at high-risk thresholds. Crucially, the system provided SHAP explanations showing which features drove each prediction.',
    results: [
      'Detected sepsis 8.2 hours earlier on average compared to traditional screening',
      'Reduced sepsis-related mortality by 18% in the pilot unit',
      'False positive rate decreased by 35% compared to rule-based alerts',
      'Clinician trust improved significantly due to model explanations',
    ],
    keyLessons: [
      'Interpretability is essential - clinicians only trusted the model after seeing SHAP explanations',
      'Integration with EHR workflow was critical for adoption',
      'Continuous monitoring detected model drift after 6 months, requiring retraining',
      'Human-in-the-loop design meant alerts augmented (not replaced) clinical judgment',
    ],
  },
  {
    id: '2',
    title: 'Diabetic Retinopathy Screening',
    institution: 'Community Health Network (Educational Example)',
    modelType: 'Convolutional Neural Network',
    outcome: 'success',
    summary: 'Deep learning model for automated detection of diabetic retinopathy from fundus photographs in underserved areas.',
    challenge: 'Rural clinics lacked access to ophthalmologists for routine diabetic retinopathy screening. Delayed diagnosis led to preventable vision loss in high-risk diabetic populations.',
    solution: 'Deployed a CNN trained on 120,000 labeled retinal images to classify diabetic retinopathy severity. Primary care providers could capture fundus photos, and the model provided immediate risk stratification. High-risk cases were flagged for urgent ophthalmology referral.',
    results: [
      'Screened 15,000+ diabetic patients in first year (3x previous capacity)',
      'Sensitivity: 94.5% for referable retinopathy',
      'Reduced time-to-referral from 6 weeks to 2 days for high-risk patients',
      'Cost per screening reduced by 60%',
    ],
    keyLessons: [
      'Pre-deployment validation on local patient population was essential (model performed worse on ethnic minorities until retrained)',
      'Image quality control was critical - 12% of initial images were unreadable',
      'Clear communication about model limitations prevented over-reliance',
      'Regular audit of false negatives ensured patient safety',
    ],
  },
  {
    id: '3',
    title: 'Readmission Risk Prediction',
    institution: 'University Medical Center (Educational Example)',
    modelType: 'Logistic Regression',
    outcome: 'mixed',
    summary: 'ML model to predict 30-day hospital readmission risk for resource allocation and intervention targeting.',
    challenge: 'Hospital faced financial penalties for high readmission rates. Needed to identify high-risk patients for discharge planning and follow-up interventions.',
    solution: 'Implemented a logistic regression model using diagnosis codes, prior utilization, demographics, and social determinants of health. Patients with predicted risk >30% received intensive case management.',
    results: [
      'Overall readmission rate decreased by 12%',
      'However, disparity analysis revealed the model systematically under-predicted risk for Black patients',
      'Root cause: social determinants data was systematically missing for minority populations',
      'Model performed well for majority group but reinforced existing health inequities',
    ],
    keyLessons: [
      'Fairness evaluation must be conducted before deployment, not after',
      'Missing data is not "missing at random" - often reflects systemic biases',
      'Model performance metrics alone do not guarantee equitable outcomes',
      'Demographic subgroup analysis should be standard practice',
      'Subsequent model retrained with more comprehensive social determinants data and fairness constraints',
    ],
  },
  {
    id: '4',
    title: 'ICU Mortality Prediction',
    institution: 'Academic Medical Center (Educational Example)',
    modelType: 'Random Forest',
    outcome: 'cautionary',
    summary: 'A cautionary tale about deploying a mortality prediction model without adequate clinical integration.',
    challenge: 'ICU wanted to predict mortality risk to guide goals-of-care conversations and resource allocation.',
    solution: 'Researchers developed a high-accuracy random forest model (AUC 0.91) using APACHE scores, vitals, and lab data. Model was deployed with minimal clinician input on workflow integration.',
    results: [
      'Model achieved excellent discrimination in validation',
      'However, clinicians found predictions confusing and did not trust "black box" scores',
      'No clear guidance on how to act on predictions',
      'Predictions sometimes contradicted clinical gestalt, causing confusion',
      'Project was discontinued after 3 months due to lack of clinical adoption',
    ],
    keyLessons: [
      'Technical performance ≠ clinical utility',
      'Clinician involvement from the start is essential, not optional',
      'Explainability matters even more for high-stakes decisions',
      'Must define clear clinical workflows for model predictions before deployment',
      'Validation metrics alone do not predict real-world success',
    ],
  },
  {
    id: '5',
    title: 'Pneumonia Diagnosis from Chest X-rays',
    institution: 'Emergency Department Network (Educational Example)',
    modelType: 'Deep Learning (ResNet)',
    outcome: 'mixed',
    summary: 'Deep learning model to assist emergency physicians in detecting pneumonia from chest radiographs.',
    challenge: 'ED physicians needed rapid pneumonia detection, especially during influenza season when volumes surge. Radiologist reads often delayed by 2-4 hours.',
    solution: 'Deployed a ResNet-based model trained on 100,000+ chest X-rays to provide immediate pneumonia likelihood scores. Model output displayed alongside image in EHR.',
    results: [
      'Reduced time-to-antibiotic administration by 45 minutes on average',
      'Sensitivity: 88%, Specificity: 92%',
      'However, post-deployment analysis found the model was "cheating" - it detected pneumonia partly based on presence of medical devices (chest tubes, central lines)',
      'Model learned the shortcut that sicker patients (who have more devices) are more likely to have pneumonia',
      'This worked for prediction but failed to capture true radiographic findings',
    ],
    keyLessons: [
      'Deep learning models can learn spurious correlations that work in training but mislead clinically',
      'Saliency maps and attention visualization revealed the model was not looking at lung infiltrates',
      'Domain expertise is critical to catch these subtle failures',
      'Adversarial testing (e.g., testing on X-rays with devices removed) should be standard',
      'Model was retrained with data augmentation to remove device-based shortcuts',
    ],
  },
  {
    id: '6',
    title: 'Antibiotic Stewardship Decision Support',
    institution: 'Multi-Hospital System (Educational Example)',
    modelType: 'Decision Tree',
    outcome: 'success',
    summary: 'Interpretable decision tree to guide antibiotic selection for suspected urinary tract infections.',
    challenge: 'Overuse of broad-spectrum antibiotics was driving resistance. Needed to guide empiric therapy while awaiting culture results.',
    solution: 'Built a decision tree using local resistance patterns, patient history, and clinical features to recommend narrow-spectrum antibiotics when safe. Rules were highly interpretable (e.g., "If no hospitalization in past 90 days AND no fluoroquinolone use in past year → recommend nitrofurantoin").',
    results: [
      'Broad-spectrum antibiotic use decreased by 28%',
      'No increase in treatment failures',
      'Clinical appropriateness score improved by 34%',
      'High clinician acceptance due to transparent decision rules',
    ],
    keyLessons: [
      'Sometimes simpler models have better clinical adoption than complex ones',
      'Interpretability enabled clinicians to override recommendations when appropriate',
      'Local data (institution-specific resistance patterns) was more valuable than external models',
      'Regular updates with new resistance data were essential for sustained accuracy',
    ],
  },
];

export function CaseStudies() {
  const getOutcomeIcon = (outcome: CaseStudy['outcome']) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'mixed':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cautionary':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getOutcomeBadge = (outcome: CaseStudy['outcome']) => {
    switch (outcome) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50">Success</Badge>;
      case 'mixed':
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">Mixed Results</Badge>;
      case 'cautionary':
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50">Cautionary Tale</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Case Studies</h1>
        <p className="text-muted-foreground mt-2">
          Real-world scenarios demonstrating ML application in clinical decision support
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            About These Case Studies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            These educational case studies are based on real-world ML implementations in healthcare settings.
            They illustrate both successes and failures, highlighting critical lessons about model deployment,
            clinical integration, fairness, and interpretability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Success stories with measurable impact</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Mixed outcomes revealing important nuances</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">Cautionary tales to learn from</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {caseStudies.map((study) => (
          <Card key={study.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getOutcomeIcon(study.outcome)}
                  <div>
                    <CardTitle className="text-xl">{study.title}</CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {study.institution}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {study.modelType}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                {getOutcomeBadge(study.outcome)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">{study.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h3 className="font-semibold mb-2 text-sm">Challenge</h3>
                  <p className="text-sm text-muted-foreground">{study.challenge}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h3 className="font-semibold mb-2 text-sm">Solution</h3>
                  <p className="text-sm text-muted-foreground">{study.solution}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Results
                </h3>
                <ul className="space-y-1">
                  {study.results.map((result, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Key Lessons
                </h3>
                <ul className="space-y-2">
                  {study.keyLessons.map((lesson, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="font-semibold text-primary mt-0.5">{idx + 1}.</span>
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Common Themes Across Case Studies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Interpretability is not optional:</strong> Clinicians need to understand why a model made a prediction to trust and appropriately use it.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Technical performance ≠ clinical utility:</strong> High AUC does not guarantee real-world impact or adoption.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Fairness must be evaluated proactively:</strong> Models can perpetuate or amplify existing healthcare disparities.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Workflow integration is critical:</strong> Models must fit into clinical workflows, not the other way around.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Continuous monitoring is essential:</strong> Model performance degrades over time due to data drift and changing clinical practices.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span><strong>Local validation matters:</strong> External models often need retraining on local populations and practices.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
