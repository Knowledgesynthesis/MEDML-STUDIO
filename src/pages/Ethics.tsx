import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, AlertTriangle, Users, Scale, Eye, FileText } from 'lucide-react';

export function Ethics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ethics & Fairness</h1>
        <p className="text-muted-foreground mt-2">
          Understanding bias, fairness, and ethical considerations in clinical ML
        </p>
      </div>

      {/* Ethical Principles */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Core Ethical Principles</CardTitle>
          </div>
          <CardDescription>
            Fundamental principles for responsible AI in healthcare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Transparency
              </h3>
              <p className="text-sm text-muted-foreground">
                Models must be explainable to clinicians and patients. The decision-making
                process should be interpretable and auditable.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Accountability
              </h3>
              <p className="text-sm text-muted-foreground">
                Clear responsibility for model development, deployment, and outcomes.
                Human oversight must remain in clinical decision-making.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Fairness
              </h3>
              <p className="text-sm text-muted-foreground">
                Models should perform equitably across different demographic groups and
                not perpetuate healthcare disparities.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient-Centered
              </h3>
              <p className="text-sm text-muted-foreground">
                AI should augment, not replace, the patient-provider relationship.
                Patient autonomy and informed consent remain paramount.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Types of Bias */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Types of Bias in Healthcare ML</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selection Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Training data not representative of the target population
              </p>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-3">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-xs text-muted-foreground">
                  A model trained only on data from tertiary care centers may perform
                  poorly in primary care settings or underserved communities.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mitigation Strategies:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Ensure diverse, representative training data</li>
                  <li>• Validate on external datasets</li>
                  <li>• Document data collection methods</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Measurement Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Systematic errors in how features or outcomes are measured
              </p>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-3">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-xs text-muted-foreground">
                  Pulse oximetry readings can be less accurate for patients with darker
                  skin tones, leading to biased oxygen saturation predictions.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mitigation Strategies:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Use validated measurement tools</li>
                  <li>• Account for measurement limitations</li>
                  <li>• Consider multiple data sources</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historical Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Biases embedded in historical healthcare delivery patterns
              </p>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-3">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-xs text-muted-foreground">
                  Past underdiagnosis of certain conditions in specific populations can
                  lead models to perpetuate these diagnostic disparities.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mitigation Strategies:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Be aware of historical healthcare inequities</li>
                  <li>• Use current, evidence-based outcome definitions</li>
                  <li>• Consult domain experts and affected communities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Algorithmic Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Bias introduced by model architecture or optimization choices
              </p>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-3">
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-xs text-muted-foreground">
                  Optimizing only for overall accuracy can lead to poor performance on
                  minority subgroups within the data.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mitigation Strategies:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Evaluate performance across subgroups</li>
                  <li>• Consider fairness-aware training methods</li>
                  <li>• Use appropriate evaluation metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fairness Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Fairness Metrics</CardTitle>
          <CardDescription>
            Common metrics for assessing algorithmic fairness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Demographic Parity</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Equal positive prediction rates across different groups
            </p>
            <Badge variant="outline" className="text-xs">
              P(ŷ=1|A=a) = P(ŷ=1|A=b)
            </Badge>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Equalized Odds</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Equal true positive and false positive rates across groups
            </p>
            <Badge variant="outline" className="text-xs">
              TPR and FPR equal across groups
            </Badge>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Predictive Parity</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Equal positive predictive values across different groups
            </p>
            <Badge variant="outline" className="text-xs">
              P(Y=1|ŷ=1,A=a) = P(Y=1|ŷ=1,A=b)
            </Badge>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Important Note
            </p>
            <p className="text-xs text-muted-foreground">
              Different fairness metrics can be mutually exclusive. The choice of metric
              should be guided by clinical context and stakeholder input, not just
              mathematical optimization.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory and Professional Guidelines</CardTitle>
          <CardDescription>
            Framework for ethical AI in healthcare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">FDA</Badge>
                <div>
                  <h3 className="font-semibold mb-1">
                    Software as a Medical Device (SaMD)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    FDA guidance on developing, validating, and monitoring ML-based
                    medical devices with emphasis on transparency and real-world
                    performance monitoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">AMA</Badge>
                <div>
                  <h3 className="font-semibold mb-1">
                    Augmented Intelligence in Medicine
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    American Medical Association principles emphasizing human oversight,
                    transparency, and the role of AI in augmenting (not replacing)
                    clinical judgment.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">EU</Badge>
                <div>
                  <h3 className="font-semibold mb-1">EU AI Act</h3>
                  <p className="text-sm text-muted-foreground">
                    European Union regulations classifying healthcare AI as
                    high-risk, requiring rigorous validation, transparency, and
                    human oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ethical Decision Framework */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Ethical Decision Framework</CardTitle>
          <CardDescription>
            Questions to ask when evaluating ML for clinical use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </span>
              <div>
                <p className="font-medium">Is the model transparent and explainable?</p>
                <p className="text-sm text-muted-foreground">
                  Can clinicians understand how predictions are made?
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </span>
              <div>
                <p className="font-medium">Has it been validated on diverse populations?</p>
                <p className="text-sm text-muted-foreground">
                  Does performance vary across demographic groups?
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </span>
              <div>
                <p className="font-medium">Are there safeguards against harm?</p>
                <p className="text-sm text-muted-foreground">
                  What happens when the model is wrong? Are there human oversight mechanisms?
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </span>
              <div>
                <p className="font-medium">Is informed consent maintained?</p>
                <p className="text-sm text-muted-foreground">
                  Are patients aware AI is being used in their care?
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                5
              </span>
              <div>
                <p className="font-medium">Who is accountable for outcomes?</p>
                <p className="text-sm text-muted-foreground">
                  Is there clear responsibility for model performance and adverse events?
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
