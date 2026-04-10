import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { AcceptancePortalService } from '../../app/core/services/acceptance-portal.service';
import { OtpInputComponent } from '../../app/shared/components/otp-input/otp-input.component';
import { WaterfallDisplayComponent } from '../../app/shared/components/waterfall-display/waterfall-display.component';
import { CurrencyFormatPipe } from '../../app/shared/pipes/currency-format.pipe';
import { BehaviorSubject } from 'rxjs';

type Step = 'review' | 'reject-reason' | 'otp' | 'confidence' | 'confirmed' | 'rejected';

@Component({
  selector: 'ccd-acceptance-portal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatIconModule, MatStepperModule,
    OtpInputComponent, WaterfallDisplayComponent, CurrencyFormatPipe,
  ],
  template: `
    <div class="portal-page">
      <div class="portal-card">
        <!-- Brand header -->
        <div class="portal-header">
          <div class="brand-logo">CX</div>
          <div>
            <div class="brand-name">CIXOR CashDay</div>
            <div class="portal-subtitle">Invoice Acceptance Portal</div>
          </div>
        </div>

        @if (loading) {
          <div class="portal-loading">
            <mat-icon class="spin">sync</mat-icon>
            <span>Loading…</span>
          </div>
        } @else if (error) {
          <div class="portal-error">
            <mat-icon>error_outline</mat-icon>
            <div class="error-title">Invalid or Expired Link</div>
            <p>This acceptance link is no longer valid. Please contact your service provider.</p>
          </div>
        } @else {
          <!-- Step: Review -->
          @if (step === 'review' && portalData) {
            <div class="step-content">
              <div class="step-badge">Step 1 of 4 — Invoice Review</div>
              <h2 class="portal-title">Review Invoice</h2>
              <p class="portal-desc">Please review the invoice details below before proceeding. This secure link expires on {{ portalData.expiresAt | date:'d MMM y, HH:mm' }}.</p>

              <div class="inv-summary mb-4">
                <div class="inv-row"><span>Invoice Number</span><strong>{{ portalData.invoice.invoiceNumber }}</strong></div>
                <div class="inv-row"><span>Issue Date</span><span>{{ portalData.invoice.issueDate | date:'d MMM y' }}</span></div>
                <div class="inv-row"><span>Due Date</span><span>{{ portalData.invoice.dueDate | date:'d MMM y' }}</span></div>
                <div class="inv-row"><span>Service Month</span><span>{{ portalData.invoice.serviceMonth || '—' }}</span></div>
              </div>

              <ccd-waterfall [breakdown]="portalData.invoice.waterfallBreakdown" />

              <div class="inv-total mt-4">
                <span>Total Amount</span>
                <span class="inv-total-amt">{{ portalData.invoice.totalAmount | ccdCurrency }}</span>
              </div>

              @if (portalData.invoice.notes) {
                <div class="inv-notes mt-4">
                  <div class="notes-label">Notes</div>
                  <p>{{ portalData.invoice.notes }}</p>
                </div>
              }

              <div class="notice-box mt-4">
                <mat-icon>verified_user</mat-icon>
                <div>
                  <strong>Trust & compliance notice</strong>
                  <p>This review confirms invoice validity only. No liquidation or payment rerouting can occur without a separate buyer consent request.</p>
                </div>
              </div>

              <div class="btn-group mt-6">
                <button class="ccd-btn btn-danger-outline" (click)="rejectInvoice()">Reject Invoice</button>
                <button class="ccd-btn btn-primary" (click)="proceedToOtp()">Accept &amp; Continue</button>
              </div>
            </div>
          }

          @if (step === 'reject-reason') {
            <div class="step-content">
              <div class="step-badge">Optional — Rejection reason</div>
              <h2 class="portal-title">Why are you rejecting this invoice?</h2>
              <p class="portal-desc">Your feedback will be sent to the seller so they can correct the invoice if needed.</p>

              <form [formGroup]="rejectForm" (ngSubmit)="submitRejection()">
                <div class="form-field">
                  <label class="ccd-label">Reason</label>
                  <select formControlName="reason" class="ccd-input">
                    <option value="Incorrect amount">Incorrect amount</option>
                    <option value="Incorrect line items">Incorrect line items</option>
                    <option value="Missing documentation">Missing documentation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-field mt-4">
                  <label class="ccd-label">Additional details</label>
                  <textarea formControlName="details" class="ccd-input" rows="3" placeholder="Add context for the seller (optional)"></textarea>
                </div>

                <div class="btn-group mt-6">
                  <button type="button" class="ccd-btn btn-ghost" (click)="step = 'review'">Back</button>
                  <button type="submit" class="ccd-btn btn-danger-outline">Submit rejection</button>
                </div>
              </form>
            </div>
          }

          <!-- Step: OTP -->
          @if (step === 'otp') {
            <div class="step-content">
              <div class="step-badge">Step 2 of 4 — Verification</div>
              <h2 class="portal-title">Verify Your Identity</h2>
              <p class="portal-desc">
                A one-time PIN has been sent to <strong>{{ portalData?.maskedPhone }}</strong>.
                Enter it below to continue. For the demo workspace, use <strong>123456</strong>.
              </p>

              <ccd-otp-input [length]="6" (completed)="onOtpComplete($event)" />

              @if (otpError) {
                <div class="otp-error">{{ otpError }}</div>
              }

              <div class="btn-group mt-6">
                <button class="ccd-btn btn-ghost" (click)="step = 'review'">Back</button>
                <button class="ccd-btn btn-ghost" (click)="resendOtp()" [disabled]="resendCooldown > 0">
                  Resend OTP {{ resendCooldown > 0 ? '(' + resendCooldown + 's)' : '' }}
                </button>
              </div>
            </div>
          }

          <!-- Step: Confidence Rating -->
          @if (step === 'confidence') {
            <div class="step-content">
              <div class="step-badge">Step 3 of 4 — Confidence Rating</div>
              <h2 class="portal-title">Payment Confidence</h2>
              <p class="portal-desc">How confident are you that this invoice will be paid by the due date?</p>

              <form [formGroup]="confidenceForm" (ngSubmit)="submitAcceptance()">
                <div class="confidence-options">
                  @for (opt of confidenceOptions; track opt.value) {
                    <label class="confidence-option" [class.selected]="confidenceForm.get('rating')?.value === opt.value">
                      <input type="radio" formControlName="rating" [value]="opt.value" class="sr-only" />
                      <div class="conf-emoji">{{ opt.emoji }}</div>
                      <div class="conf-label">{{ opt.label }}</div>
                      <div class="conf-value">{{ opt.value }}%</div>
                    </label>
                  }
                </div>

                <div class="form-field mt-4">
                  <label class="ccd-label">Additional Comments (Optional)</label>
                  <textarea formControlName="comments" class="ccd-input" rows="3" placeholder="Any concerns or notes…"></textarea>
                </div>

                <div class="btn-group mt-6">
                  <button type="button" class="ccd-btn btn-ghost" (click)="step = 'otp'">Back</button>
                  <button type="submit" class="ccd-btn btn-primary" [disabled]="confidenceForm.invalid || submitting">
                    {{ submitting ? 'Submitting…' : 'Submit Acceptance' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Step: Confirmed -->
          @if (step === 'confirmed') {
            <div class="step-content text-center">
              <div class="step-badge">Step 4 of 4 — Complete</div>
              <div class="success-icon"><mat-icon>check_circle</mat-icon></div>
              <h2 class="portal-title">Invoice Accepted</h2>
              <p class="portal-desc">
                Thank you! Invoice <strong>{{ portalData?.invoice?.invoiceNumber }}</strong> has been accepted.
                Your reference number is <strong>{{ confirmationRef }}</strong>.
              </p>
              <p class="text-muted text-sm mt-2">A confirmation has been sent to your email address.</p>
            </div>
          }

          <!-- Step: Rejected -->
          @if (step === 'rejected') {
            <div class="step-content text-center">
              <div class="rejected-icon"><mat-icon>cancel</mat-icon></div>
              <h2 class="portal-title">Invoice Rejected</h2>
              <p class="portal-desc">You have rejected invoice {{ portalData?.invoice?.invoiceNumber }}. The service provider has been notified.</p>
            </div>
          }
        }

        <div class="portal-footer">
          Powered by CIXOR CashDay &copy; {{ year }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portal-page { min-height: 100vh; background: var(--ccd-bg); display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }
    .portal-card { width: 100%; max-width: 600px; background: var(--ccd-surface-1); border-radius: var(--radius-xl); border: 1px solid var(--ccd-border); overflow: hidden; }
    .portal-header { display: flex; align-items: center; gap: 14px; padding: 24px 32px; background: var(--ccd-surface-2); border-bottom: 1px solid var(--ccd-border); }
    .brand-logo { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--ccd-primary); color: #000; font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 16px; font-weight: 800; color: var(--ccd-text); }
    .portal-subtitle { font-size: 12px; color: var(--ccd-text-muted); }
    .step-content { padding: 32px; }
    .step-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ccd-primary); background: color-mix(in srgb, var(--ccd-primary) 12%, transparent); padding: 4px 12px; border-radius: var(--radius-full); margin-bottom: 16px; }
    .portal-title { font-size: 22px; font-weight: 800; color: var(--ccd-text); margin: 0 0 8px; }
    .portal-desc { font-size: 14px; color: var(--ccd-text-muted); margin: 0 0 20px; }
    .inv-summary { background: var(--ccd-surface-2); border-radius: var(--radius-md); padding: 16px; }
    .inv-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid var(--ccd-border); &:last-child { border-bottom: none; } span:first-child { color: var(--ccd-text-muted); } }
    .inv-total { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid var(--ccd-border); padding-top: 14px; font-size: 16px; font-weight: 700; color: var(--ccd-text); }
    .inv-total-amt { font-size: 24px; font-family: 'JetBrains Mono', monospace; color: var(--ccd-primary); }
    .inv-notes { background: var(--ccd-surface-2); border-radius: var(--radius-md); padding: 14px; }
    .notes-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ccd-text-muted); margin-bottom: 6px; }
    .notice-box { display: flex; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); background: color-mix(in srgb, var(--ccd-secondary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--ccd-secondary) 25%, transparent); mat-icon { color: var(--ccd-secondary); } p { margin: 4px 0 0; color: var(--ccd-text-muted); font-size: 13px; } }
    .btn-group { display: flex; gap: 12px; justify-content: flex-end; }
    .portal-loading { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 40px; color: var(--ccd-text-muted); }
    .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
    .portal-error { padding: 40px 32px; text-align: center; color: var(--ccd-danger); mat-icon { font-size: 48px; width: 48px; height: 48px; } }
    .error-title { font-size: 20px; font-weight: 700; margin: 12px 0 8px; }
    .otp-error { color: var(--ccd-danger); font-size: 13px; margin-top: 8px; text-align: center; }
    .confidence-options { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .confidence-option { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 8px; border-radius: var(--radius-md); border: 2px solid var(--ccd-border); cursor: pointer; transition: border-color 0.15s, background 0.15s; &.selected { border-color: var(--ccd-primary); background: color-mix(in srgb, var(--ccd-primary) 10%, transparent); } &:hover:not(.selected) { border-color: var(--ccd-surface-3); } }
    .conf-emoji { font-size: 24px; }
    .conf-label { font-size: 11px; font-weight: 700; color: var(--ccd-text-muted); text-align: center; }
    .conf-value { font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--ccd-primary); }
    .success-icon { mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--ccd-success); } }
    .rejected-icon { mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--ccd-danger); } }
    .text-center { text-align: center; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .portal-footer { text-align: center; padding: 16px; font-size: 12px; color: var(--ccd-text-muted); border-top: 1px solid var(--ccd-border); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptancePortalComponent implements OnInit {
  step: Step = 'review';
  loading = true;
  error = false;
  submitting = false;
  portalData: any = null;
  otpError = '';
  otpValue = '';
  confirmationRef = '';
  resendCooldown = 0;
  year = new Date().getFullYear();

  confidenceForm!: FormGroup;
  rejectForm!: FormGroup;

  confidenceOptions = [
    { value: 100, label: 'Very High', emoji: '😊' },
    { value: 80,  label: 'High',      emoji: '🙂' },
    { value: 60,  label: 'Moderate',  emoji: '😐' },
    { value: 40,  label: 'Low',       emoji: '😟' },
    { value: 20,  label: 'Very Low',  emoji: '😰' },
  ];

  constructor(
    private route: ActivatedRoute,
    private portalService: AcceptancePortalService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.confidenceForm = this.fb.group({
      rating:   [null, Validators.required],
      comments: [''],
    });
    this.rejectForm = this.fb.group({
      reason: ['Incorrect amount', Validators.required],
      details: [''],
    });

    this.portalService.getPortalData(token).subscribe({
      next: data => { this.portalData = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  proceedToOtp(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.portalService.sendOtp(token).subscribe({
      next: () => { this.step = 'otp'; this.startCooldown(60); },
      error: () => { this.step = 'otp'; },
    });
  }

  onOtpComplete(otp: string): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.otpValue = otp;
    this.otpError = '';
    this.portalService.verifyOtp({ token, otp }).subscribe({
      next: () => { this.step = 'confidence'; },
      error: () => { this.otpError = 'Invalid OTP. Please try again.'; },
    });
  }

  resendOtp(): void {
    if (this.resendCooldown > 0) return;
    this.proceedToOtp();
  }

  submitAcceptance(): void {
    if (this.confidenceForm.invalid) return;
    const token = this.route.snapshot.paramMap.get('token')!;
    this.submitting = true;
    this.portalService.accept({ token, otp: this.otpValue, confidenceScore: this.confidenceForm.value.rating, notes: this.confidenceForm.value.comments }).subscribe({
      next: (res: any) => {
        this.confirmationRef = res?.referenceNumber ?? 'CCD-' + Date.now();
        this.step = 'confirmed';
        this.submitting = false;
      },
      error: () => { this.submitting = false; },
    });
  }

  rejectInvoice(): void {
    this.step = 'reject-reason';
  }

  submitRejection(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    const reason = this.rejectForm.value.details || this.rejectForm.value.reason || 'Rejected by officer';
    this.portalService.reject({ token, otp: this.otpValue, reason }).subscribe({
      next: () => { this.step = 'rejected'; },
      error: () => { this.step = 'rejected'; },
    });
  }

  private startCooldown(secs: number): void {
    this.resendCooldown = secs;
    const t = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(t);
    }, 1000);
  }
}
