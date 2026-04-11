<script lang="ts">
  let { url, email }: { url: string; email: string } = $props();
</script>

<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; padding: 48px 24px; background: #fafafa; color: #0a0a0a;">
  <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; margin: 0 0 24px; line-height: 1.2;">
    Rule 257
  </h1>
  <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
    Click the link below to sign in to your account.
  </p>
  <p style="margin: 32px 0;">
    <a href={url} style="display: inline-block; padding: 14px 28px; background: #0a0a0a; color: #fafafa; text-decoration: none; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
      Sign in
    </a>
  </p>
  <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 0;">
    This link expires in 10 minutes. If you didn't request it, you can safely ignore this email.
  </p>
  <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b6b6b; margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
    Rule 257 &middot; 54 Eldridge St, New York, NY
  </p>
  <!-- email used for tracking context, not rendered -->
  <span style="display:none">{email}</span>
</div>
