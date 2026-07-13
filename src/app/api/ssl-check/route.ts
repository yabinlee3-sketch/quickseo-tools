import { NextRequest, NextResponse } from 'next/server';
import * as https from 'https';
import * as tls from 'tls';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const port = parsed.port ? parseInt(parsed.port) : 443;

    const result = await new Promise((resolve) => {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: 10000,
        },
        () => {
          const cert = socket.getPeerCertificate(true);
          const protocol = socket.getProtocol() || 'Unknown';

          if (!cert || Object.keys(cert).length === 0) {
            resolve({
              valid: false,
              url,
              hostname,
              error: 'No certificate presented',
              details: null,
              issues: ['No SSL certificate found'],
              warnings: [],
            });
            socket.end();
            return;
          }

          const validFrom = new Date(cert.valid_from).toISOString().split('T')[0];
          const validTo = new Date(cert.valid_to).toISOString().split('T')[0];
          const now = Date.now();
          const daysRemaining = Math.ceil(
            (new Date(cert.valid_to).getTime() - now) / (1000 * 60 * 60 * 24)
          );

          const issues: string[] = [];
          const warnings: string[] = [];

          if (daysRemaining < 0) {
            issues.push('Certificate has expired');
          } else if (daysRemaining < 30) {
            warnings.push(`Certificate expires in ${daysRemaining} days`);
          }

          const details = {
            protocol,
            issuer: (cert.issuer && cert.issuer.O) || cert.issuer?.CN || 'Unknown',
            validFrom,
            validTo,
            daysRemaining,
            subjectCN: cert.subject?.CN || hostname,
            subjectAltNames: cert.subjectaltname
              ? cert.subjectaltname.split(',').map((s: string) => s.trim().replace('DNS:', ''))
              : [hostname],
            fingerprint: cert.fingerprint || 'N/A',
            serialNumber: cert.serialNumber || 'N/A',
            certTransparency: cert.infoAccess?.['CT Poison'] !== undefined || false,
          };

          resolve({
            valid: daysRemaining >= 0,
            url,
            hostname,
            details,
            issues,
            warnings,
          });

          socket.end();
        }
      );

      socket.on('error', (err: Error) => {
        resolve({
          valid: false,
          url,
          hostname,
          error: err.message,
          details: null,
          issues: [`SSL connection failed: ${err.message}`],
          warnings: [],
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          valid: false,
          url,
          hostname,
          error: 'Connection timed out',
          details: null,
          issues: ['SSL connection timed out'],
          warnings: [],
        });
      });

      socket.setTimeout(10000);
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: null,
        issues: ['Internal error during SSL check'],
        warnings: [],
      },
      { status: 200 }
    );
  }
}
