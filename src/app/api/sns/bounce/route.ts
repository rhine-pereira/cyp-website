import { NextRequest, NextResponse } from 'next/server';
import { addToSuppressionList } from '@/app/lib/email-suppression';

// Force dynamic rendering - required for webhooks
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// SNS message types
interface SNSMessage {
    Type: 'SubscriptionConfirmation' | 'Notification' | 'UnsubscribeConfirmation';
    MessageId: string;
    Token?: string;
    TopicArn: string;
    Message: string;
    SubscribeURL?: string;
    Timestamp: string;
    SignatureVersion: string;
    Signature: string;
    SigningCertURL: string;
}

interface SESBounceNotification {
    notificationType: 'Bounce';
    bounce: {
        bounceType: 'Permanent' | 'Transient' | 'Undetermined';
        bounceSubType: string;
        bouncedRecipients: Array<{
            emailAddress: string;
            action?: string;
            status?: string;
            diagnosticCode?: string;
        }>;
        timestamp: string;
        feedbackId: string;
    };
    mail: {
        messageId: string;
        source: string;
        timestamp: string;
    };
}

interface SESComplaintNotification {
    notificationType: 'Complaint';
    complaint: {
        complainedRecipients: Array<{
            emailAddress: string;
        }>;
        timestamp: string;
        feedbackId: string;
        complaintFeedbackType?: string;
    };
    mail: {
        messageId: string;
        source: string;
        timestamp: string;
    };
}

interface SESDeliveryNotification {
    notificationType: 'Delivery';
    delivery: {
        recipients: string[];
        timestamp: string;
    };
    mail: {
        messageId: string;
    };
}

type SESNotification = SESBounceNotification | SESComplaintNotification | SESDeliveryNotification;

/**
 * Handle AWS SNS notifications for SES bounces and complaints
 * Configure SNS to send to: https://your-domain.com/api/sns/bounce
 */
export async function POST(request: NextRequest) {
    try {
        // SNS sends messages as text/plain with JSON body
        const body = await request.text();
        let snsMessage: SNSMessage;

        try {
            snsMessage = JSON.parse(body);
        } catch {
            console.error('[sns-bounce] Failed to parse SNS message:', body);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        console.log(`[sns-bounce] Received SNS message type: ${snsMessage.Type}`);

        // Handle subscription confirmation
        if (snsMessage.Type === 'SubscriptionConfirmation') {
            if (snsMessage.SubscribeURL) {
                console.log('[sns-bounce] Confirming SNS subscription...');
                // Fetch the SubscribeURL to confirm the subscription
                const confirmResponse = await fetch(snsMessage.SubscribeURL);
                if (confirmResponse.ok) {
                    console.log('[sns-bounce] SNS subscription confirmed successfully');
                    return NextResponse.json({ message: 'Subscription confirmed' });
                } else {
                    console.error('[sns-bounce] Failed to confirm subscription');
                    return NextResponse.json({ error: 'Subscription confirmation failed' }, { status: 500 });
                }
            }
            return NextResponse.json({ error: 'No SubscribeURL provided' }, { status: 400 });
        }

        // Handle unsubscribe confirmation
        if (snsMessage.Type === 'UnsubscribeConfirmation') {
            console.log('[sns-bounce] Received unsubscribe confirmation');
            return NextResponse.json({ message: 'Unsubscribe acknowledged' });
        }

        // Handle notification (bounce/complaint)
        if (snsMessage.Type === 'Notification') {
            let notification: SESNotification;

            try {
                notification = JSON.parse(snsMessage.Message);
            } catch {
                console.error('[sns-bounce] Failed to parse SES notification:', snsMessage.Message);
                return NextResponse.json({ error: 'Invalid notification format' }, { status: 400 });
            }

            // Handle bounces
            if (notification.notificationType === 'Bounce') {
                const bounce = notification as SESBounceNotification;
                console.log(`[sns-bounce] Processing bounce: ${bounce.bounce.bounceType}/${bounce.bounce.bounceSubType}`);

                // Only suppress on permanent bounces (hard bounces)
                // Transient bounces are temporary and might resolve
                if (bounce.bounce.bounceType === 'Permanent') {
                    for (const recipient of bounce.bounce.bouncedRecipients) {
                        await addToSuppressionList({
                            email: recipient.emailAddress,
                            reason: 'bounce',
                            bounce_type: bounce.bounce.bounceType,
                            bounce_subtype: bounce.bounce.bounceSubType,
                            source: bounce.mail.messageId,
                        });
                    }
                    console.log(`[sns-bounce] Added ${bounce.bounce.bouncedRecipients.length} emails to suppression list`);
                } else {
                    console.log(`[sns-bounce] Skipping transient bounce for: ${bounce.bounce.bouncedRecipients.map(r => r.emailAddress).join(', ')}`);
                }

                return NextResponse.json({ message: 'Bounce processed' });
            }

            // Handle complaints (always suppress - user marked as spam)
            if (notification.notificationType === 'Complaint') {
                const complaint = notification as SESComplaintNotification;
                console.log(`[sns-bounce] Processing complaint: ${complaint.complaint.complaintFeedbackType || 'unknown'}`);

                for (const recipient of complaint.complaint.complainedRecipients) {
                    await addToSuppressionList({
                        email: recipient.emailAddress,
                        reason: 'complaint',
                        source: complaint.mail.messageId,
                    });
                }
                console.log(`[sns-bounce] Added ${complaint.complaint.complainedRecipients.length} complaint emails to suppression list`);

                return NextResponse.json({ message: 'Complaint processed' });
            }

            // Delivery notifications - just acknowledge, no action needed
            if (notification.notificationType === 'Delivery') {
                return NextResponse.json({ message: 'Delivery acknowledged' });
            }
        }

        return NextResponse.json({ message: 'OK' });
    } catch (error) {
        console.error('[sns-bounce] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: 'sns-bounce-handler' });
}
