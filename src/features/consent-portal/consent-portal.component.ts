import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcceptancePortalService } from '../../app/core/services/acceptance-portal.service';
import { OtpInputComponent } from '../../app/shared/components/otp-input/otp-input.component';
import { CurrencyFormatPipe } from '../../app/shared/pipes/currency-format.pipe';

type Step = 'summary' | 'otp' | 'review' | 'decline' | 'confirmed' | 'rejected';

@Component({
  selector: 'ccd-consent-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, OtpInputComponent, CurrencyFormatPipe],
  template: `
    <div class="portal-page">
      <div class="portal-card">
        <div class="portal-header">
          <div class="brand-logo">CX</div>
          <div>
            <div class="brand-name">CIXOR CashDay</div>
            <div class="portal-subtitle">Funding Consent Portal</div>
          </div>
        </div>

        @if (loading) {
          <div class="portal-loading"><mat-icon class="spin">sync</mat-icon> Loading…</div>
        } @else if (error) {
          <div class="portal-error">
            <mat-icon>error_outline</mat-icon>
            <div class="error-title">Invalid or Expired Link</div>
            <p>This consent link is no longer valid.</p>
          </div>
        } @else {
          <!-- Step 1: Summary -->
          @if (step === 'summary' && portalData) {
            <div class="step-content">
              <div class="step-badge">Step 1 of 4 — Funding Summary</div>
              <h2 class="portal-title">Funding Consent</h2>
              <p class="portal-desc">Review the funding details for your invoice. By consenting, you authorise CashDay to fund this invoice and redirect repayment according to the updated settlement path.</p>
              <div class="funding-summary mb-4">
                <div class="fs-row"><span>Invoice</span><strong>{{ portalData.invoice?.invoiceNumber }}</strong></div>
                <div class="fs-row"><span>Invoice Amount</span><span>{{ portalData.invoice?.totalAmount | ccdCurrency }}</span></div>
                <div class="fs-row"><span>Funded Amount</span><span class="primary">{{ portalData.fundedAmount | ccdCurrency }}</span></div>
                <div class="fs-row"><span>Funding Fee</span><span>{{ portalData.fundingFee | ccdCurrency }}</span></div>
                <div class="fs-row"><span>Net Advance</span><strong>{{ portalData.netAdvance | ccdCurrency }}</strong></div>
                <div class="fs-row"><span>Repayment Date</span><span>{{ portalData.repaymentDate | date:'d MMM y' }}</span></div>
              </div>
              <div class="terms-box">
                <p class="text-sm">By consenting, you agree to the CashDay funding terms and conditions. The funded amount will be remitted to your registered bank account within 2 business days.</p>
              </div>
              <div class="btn-group mt-6">
                <button class="ccd-btn btn-danger-outline" (click)="step = 'decline'">Decline</button>
                <button class="ccd-btn btn-primary" (click)="proceedToOtp()">Proceed to Verification</button>
              </div>
            </div>
          }

          @if (step === 'decline') {
            <div class="step-content">
              <div class="step-badge">Optional — Decline reason</div>
              <h2 class="portal-title">Tell us why you are declining</h2>
              <p class="portal-desc">This helps the seller resolve the issue without further follow-up.</p>
              <form [formGroup]="declineForm" (ngSubmit)="submitDecline()">
                <div class="form-field">
                  <label class="ccd-label">Reason</label>
                  <select formControlName="reason" class="ccd-input">
                    <option value="Funding terms not accepted">Funding terms not accepted</option>
                    <option value="Need internal review">Need internal review</option>
                    <option value="Invoice disputed">Invoice disputed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-field mt-4">
                  <label class="ccd-label">Additional details</label>
                  <textarea formControlName="details" class="ccd-input" rows="3" placeholder="Optional notes"></textarea>
                </div>
                <div class="btn-group mt-6">
                  <button type="button" class="ccd-btn btn-ghost" (click)="step = 'summary'">Back</button>
                  <button type="submit" class="ccd-btn btn-danger-outline">Submit decline</button>
                </div>
              </form>
            </div>
          }

          <!-- Step 2: OTP -->
          @if (step === 'otp') {
            <div class="step-content">
              <div class="step-badge">Step 2 of 4 — OTP Verification</div>
              <h2 class="portal-title">Verify Your Identity</h2>
              <p class="portal-desc">Enter the 6-digit OTP sent to <strong>{{ portalData?.maskedPhone }}</strong>. For the demo workspace, use <strong>123456</strong>.</p>
              <ccd-otp-input [length]="6" (completed)="onOtpComplete($event)" />
              @if (otpError) { <div class="otp-error">{{ otpError }}</div> }
              <div class="btn-group mt-6">
                <button class="ccd-btn btn-ghost" (click)="step = 'summary'">Back</button>
                <button class="ccd-btn btn-ghost" (click)="resendOtp()" [disabled]="cooldown > 0">
                  Resend {{ cooldown > 0 ? '(' + cooldown + 's)' : '' }}
                </button>
              </div>
            </div>
          }

          <!-- Step 3: Review & Sign -->
          @if (step === 'review') {
            <div class="step-content">
              <div class="step-badge">Step 3 of 4 — Final Review</div>
              <h2 class="portal-title">Confirm Consent</h2>
              <p class="portal-desc">Please confirm your agreement to the funding terms.</p>
              <form [formGroup]="consentForm" (ngSubmit)="submitConsent()">
                <div class="checkbox-row mb-4">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="termsAccepted" />
                    <span>I have read and agree to the CashDay Funding Terms &amp; Conditions</span>
                  </label>
                </div>
                <div class="checkbox-row mb-4">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="accuracyConfirmed" />
                    <span>I confirm that all information provided is accurate and complete</span>
                  </label>
                </div>
                <div class="form-field mt-4">
                  <label class="ccd-label">Full Name (Electronic Signature) *</label>
                  <input formControlName="signature" class="ccd-input" placeholder="Type your full name to sign" />
                </div>
                <div class="btn-group mt-6">
                  <button type="button" class="ccd-btn btn-ghost" (click)="step = 'otp'">Back</button>
                  <button type="submit" class="ccd-btn btn-primary" [disabled]="consentForm.invalid || submitting">
                    {{ submitting ? 'Processing…' : 'Submit Consent' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Step 4: Confirmed -->
          @if (step === 'confirmed') {
            <div class="step-content text-center">
              <div class="step-badge">Step 4 of 4 — Complete</div>
              <div class="success-icon"><mat-icon>verified</mat-icon></div>
              <h2 class="portal-title">Consent Submitted</h2>
              <p class="portal-desc">Your funding consent has been recorded. Reference: <strong>{{ confirmRef }}</strong></p>
              <p class="text-muted text-sm">The funded amount will be disbursed to your account within 2 business days.</p>
            </div>
          }

          <!-- Rejected -->
          @if (step === 'rejected') {
            <div class="step-content text-center">
              <div class="rejected-icon"><mat-icon>cancel</mat-icon></div>
              <h2 class="portal-title">Consent Declined</h2>
              <p class="portal-desc">You have declined the funding offer. No further action is required.</p>
            </div>
          }
        }

        <div class="portal-footer">Powered by CIXOR CashDay &copy; {{ year }}</div>
      </div>
    </div>
  `,
  styles: [`
    .portal-page { min-height: 100vh; background: var(--ccd-bg); display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }
    .portal-card { width: 100%; max-width: 560px; background: var(--ccd-surface-1); border-radius: var(--radius-xl); border: 1px solid var(--ccd-border); overflow: hidden; }
    .portal-header { display: flex; align-items: center; gap: 14px; padding: 24px 32px; background: var(--ccd-surface-2); border-bottom: 1px solid var(--ccd-border); }
    .brand-logo { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--ccd-primary); color: #000; font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 16px; font-weight: 800; color: var(--ccd-text); }
    .portal-subtitle { font-size: 12px; color: var(--ccd-text-muted); }
    .step-content { padding: 32px; }
    .step-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ccd-accent); background: color-mix(in srgb, var(--ccd-accent) 12%, transparent); padding: 4px 12px; border-radius: var(--radius-full); margin-bottom: 16px; }
    .portal-title { font-size: 22px; font-weight: 800; color: var(--ccd-text); margin: 0 0 8px; }
    .portal-desc { font-size: 14px; color: var(--ccd-text-muted); margin: 0 0 20px; }
    .funding-summary { background: var(--ccd-surface-2); border-radius: var(--radius-md); padding: 16px; }
    .fs-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid var(--ccd-border); &:last-child { border-bottom: none; } span:first-child { color: var(--ccd-text-muted); } }
    .primary { color: var(--ccd-primary); font-weight: 700; }
    .terms-box { background: var(--ccd-surface-2); border-radius: var(--radius-md); padding: 14px; border-left: 3px solid var(--ccd-accent); }
    .btn-group { display: flex; gap: 12px; justify-content: flex-end; }
    .portal-loading { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 40px; color: var(--ccd-text-muted); }
    .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
    .portal-error { padding: 40px 32px; text-align: center; color: var(--ccd-danger); mat-icon { font-size: 48px; width: 48px; height: 48px; } }
    .error-title { font-size: 20px; font-weight: 700; margin: 12px 0 8px; }
    .otp-error { color: var(--ccd-danger); font-size: 13px; margin-top: 8px; text-align: center; }
    .checkbox-row { }
    .checkbox-label { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--ccd-text); cursor: pointer; input { margin-top: 3px; accent-color: var(--ccd-primary); flex-shrink: 0; } }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .success-icon { mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--ccd-primary); } }
    .rejected-icon { mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--ccd-danger); } }
    .text-center { text-align: center; }
    .portal-footer { text-align: center; padding: 16px; font-size: 12px; color: var(--ccd-text-muted); border-top: 1px solid var(--ccd-border); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentPortalComponent implements OnInit {
  step: Step = 'summary';
  loading = true;
  error = false;
  submitting = false;
  portalData: any = null;
  otpError = '';
  otpValue = '';
  confirmRef = '';
  cooldown = 0;
  year = new Date().getFullYear();
  consentForm!: FormGroup;
  declineForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private portalService: AcceptancePortalService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.consentForm = this.fb.group({
      termsAccepted:     [false, Validators.requiredTrue],
      accuracyConfirmed: [false, Validators.requiredTrue],
      signature:         ['', Validators.required],
    });
    this.declineForm = this.fb.group({
      reason: ['Funding terms not accepted', Validators.required],
      details: [''],
    });

    this.portalService.getPortalData(token).subscribe({
      next: data => { this.portalData = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  proceedToOtp(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.portalService.sendOtp(token).subscribe({ next: () => { this.step = 'otp'; this.startCooldown(60); }, error: () => { this.step = 'otp'; } });
  }

  onOtpComplete(otp: string): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.otpError = '';
    this.otpValue = otp;
    this.portalService.verifyOtp({ token, otp }).subscribe({
      next: () => { this.step = 'review'; },
      error: () => { this.otpError = 'Invalid OTP. Please try again.'; },
    });
  }

  resendOtp(): void { if (this.cooldown > 0) return; this.proceedToOtp(); }

  submitConsent(): void {
    if (this.consentForm.invalid) { this.consentForm.markAllAsTouched(); return; }
    const token = this.route.snapshot.paramMap.get('token')!;
    this.submitting = true;
    this.portalService.accept({ token, otp: this.otpValue, confidenceScore: 100, notes: 'Consented' }).subscribe({
      next: (res: any) => { this.confirmRef = res?.referenceNumber ?? 'CCD-' + Date.now(); this.step = 'confirmed'; this.submitting = false; },
      error: () => { this.submitting = false; },
    });
  }

  submitDecline(): void {
    this.step = 'rejected';
  }

  private startCooldown(secs: number): void {
    this.cooldown = secs;
    const t = setInterval(() => { this.cooldown--; if (this.cooldown <= 0) clearInterval(t); }, 1000);
  }
}
