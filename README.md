# MedML Studio

**Interpretable Machine Learning for Clinical Decision Support**

An educational platform designed to teach clinicians how to understand, interpret, and critically evaluate machine learning models in clinical contexts.

---

## Overview

MedML Studio is a mobile-first, offline-capable educational application that provides an interactive sandbox for learning about interpretable machine learning in healthcare. Built with safety and transparency at its core, it uses only synthetic datasets and emphasizes ethical considerations, explainability, and clinical appropriateness.

### Key Features

- **Synthetic Datasets**: Realistic clinical scenarios (sepsis risk, diabetes prediction) using synthetic data
- **Interactive ML Models**: Train and compare logistic regression, decision trees, and more
- **Explainability Tools**: Feature importance, SHAP, LIME, calibration curves
- **Dark Mode**: Beautiful, accessible UI with dark mode support
- **Offline-Ready**: Progressive Web App (PWA) with offline capabilities
- **Educational First**: Structured learning paths with safety disclaimers

---

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with custom theming)
- **UI Components**: Custom components inspired by shadcn/ui
- **State Management**: Zustand with persistence
- **Visualizations**: Recharts + D3.js
- **ML Implementation**: Custom TypeScript implementations
- **Offline Support**: Vite PWA plugin + IndexedDB

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## Project Structure

```
MEDML-STUDIO/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Card, etc.)
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   ├── interactive/     # Interactive learning components
│   │   └── visualizations/  # ML visualization components
│   ├── lib/
│   │   ├── ml/              # ML model implementations
│   │   ├── utils/           # Utility functions
│   │   └── data/            # Data generation and management
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── pages/               # Main application pages
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Static assets
│   ├── data/                # Data schemas and content
│   │   ├── datasets/        # Synthetic dataset definitions
│   │   └── schemas/         # JSON schemas
│   ├── content/             # Educational content
│   │   ├── modules/         # Learning modules
│   │   ├── glossary/        # Term definitions
│   │   └── assessments/     # Quizzes and assessments
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static public assets
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

---

## Key Concepts

### Educational Use Only

**CRITICAL**: This platform uses synthetic datasets only and is designed exclusively for educational purposes. It should **never be used for actual clinical decision-making**.

### Synthetic Datasets

All datasets are programmatically generated to simulate realistic clinical scenarios while containing no real patient data:

- **Sepsis Risk**: Vital signs and lab values for sepsis screening
- **Diabetes Risk**: BMI, glucose levels, and lifestyle factors

### ML Models Implemented

1. **Logistic Regression**: Linear, highly interpretable baseline model
2. **Decision Trees**: Rule-based models with visual interpretation
3. **Random Forests**: (Planned) Ensemble of decision trees
4. **Gradient Boosting**: (Planned) Advanced ensemble method

### Explainability Features

- **Feature Importance**: Global understanding of variable impact
- **SHAP Values**: (Planned) Unified approach to explainability
- **LIME**: (Planned) Local interpretable model-agnostic explanations
- **Calibration Curves**: Model probability calibration
- **Confusion Matrices**: Classification performance breakdown

---

## Learning Path

The recommended learning progression:

1. **Foundations of ML in Healthcare**
   - What ML can and cannot do
   - Prediction vs causation in medicine
   - Clinical decision support categories

2. **Explore Synthetic Datasets**
   - Understanding EHR data structure
   - Feature engineering for clinical data
   - Outcome variable definitions

3. **Train & Compare Models**
   - Building interpretable models
   - Accuracy vs interpretability tradeoffs
   - Model selection for clinical contexts

4. **Master Explainability Tools**
   - Feature importance interpretation
   - Local vs global explanations
   - Communicating model behavior to stakeholders

5. **Evaluate Bias & Fairness**
   - Identifying potential biases
   - Fairness metrics and considerations
   - Ethical implications of ML in healthcare

---

## Development

### Adding New Datasets

Create a new generator function in `src/lib/data/synthetic-generator.ts`:

```typescript
export function generateNewDataset(size: number = 500): SyntheticDataset {
  // Define features
  const features: Feature[] = [...];

  // Generate data points
  const data: SyntheticDataPoint[] = [];

  // Return dataset
  return { ... };
}
```

### Adding New Models

Implement the model class in `src/lib/ml/`:

```typescript
export class NewModel {
  fit(data: SyntheticDataPoint[], featureNames: string[]): void {
    // Training logic
  }

  predict(dataPoint: SyntheticDataPoint): Prediction {
    // Prediction logic
  }

  getFeatureImportance(): FeatureImportance[] {
    // Feature importance calculation
  }
}
```

### Adding New Pages

1. Create component in `src/pages/`
2. Add route to `src/App.tsx`
3. Add navigation item to `src/components/layout/Sidebar.tsx`

---

## Offline Support

The application is configured as a Progressive Web App (PWA):

- **Service Worker**: Automatically caches assets for offline use
- **IndexedDB**: Stores user progress and trained models locally
- **Manifest**: Enables "Add to Home Screen" on mobile devices

---

## Accessibility

MedML Studio aims for WCAG 2.2 AA compliance:

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Sufficient color contrast in both light and dark modes
- Responsive design for all screen sizes

---

## Safety & Ethics

### Safety Disclaimers

All pages include prominent disclaimers that this is an educational tool only. Users are reminded:

- All datasets are synthetic
- No real patient data is used
- Not suitable for clinical decision-making
- Educational purposes only

### Ethical Considerations

The platform emphasizes:

- **Transparency**: Clear explanation of how models work
- **Accountability**: Understanding model limitations
- **Fairness**: Detecting and addressing bias
- **Clinical Appropriateness**: When to use (or not use) ML
- **Regulatory Awareness**: FDA, AMA, EU AI Act principles

---

## Regulatory Alignment

Content is aligned with:

- **FDA SaMD Guidelines**: Software as a Medical Device considerations
- **AMA AI Guidelines**: American Medical Association AI principles
- **EU AI Act**: High-risk AI system requirements
- **PROBAST-AI**: Prediction model risk of bias assessment

---

## Future Enhancements

- [ ] Additional ML models (Random Forest, Gradient Boosting, Neural Networks)
- [ ] SHAP and LIME implementations
- [ ] Interactive decision boundary visualizations
- [ ] Calibration plot interactives
- [ ] Bias and fairness analysis tools
- [ ] Clinical case studies with guided analysis
- [ ] Assessment system with progress tracking
- [ ] Export model reports
- [ ] Multi-language support
- [ ] Enhanced mobile experience

---

## Contributing

This is an educational project. Contributions that enhance:

- Educational content accuracy
- Clinical ML best practices
- Accessibility features
- Explainability tools

are welcome.

---

## License

This project is for educational purposes. Please ensure any use maintains the educational and safety-first approach.

---

## Acknowledgments

Inspired by:

- Evidence-based medicine principles
- FDA guidance on AI/ML in medical devices
- AMA's ethical guidelines for AI in healthcare
- Clinical informatics best practices
- Open-source educational resources

---

## Support

For questions or issues:

1. Check the in-app glossary
2. Review the learning modules
3. Consult the source code documentation

---

## Citation

If you use this educational platform in your research or teaching:

```
MedML Studio: Interpretable Machine Learning for Clinical Decision Support
Educational Platform, 2024
```

---

**Remember**: This is an educational tool. Always consult with clinical experts and follow institutional guidelines for real-world ML implementation in healthcare.
