import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface HttpResponse {
  status: number;
  data: any;
  rawText: string;
}

/**
 * Robust HTTP client that works across sandboxes, proxies, and standard environments.
 */
export async function executeHttpRequest(
  url: string, 
  method: 'GET' | 'POST', 
  headers: Record<string, string>, 
  body?: any,
  timeoutMs: number = 25000
): Promise<HttpResponse> {
  const args: string[] = ['-s', '-S', '-X', method];

  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`);
  }

  // Include response code extraction marker
  args.push('-w', '\n__HTTP_STATUS__:%{http_code}');
  args.push('--max-time', String(Math.round(timeoutMs / 1000)));

  if (body) {
    const jsonStr = typeof body === 'string' ? body : JSON.stringify(body);
    args.push('-d', jsonStr);
  }

  args.push(url);

  try {
    const { stdout, stderr } = await execFileAsync('curl', args, {
      maxBuffer: 10 * 1024 * 1024
    });

    const statusMarker = '\n__HTTP_STATUS__:';
    const splitIndex = stdout.lastIndexOf(statusMarker);

    let rawText = stdout;
    let statusCode = 200;

    if (splitIndex !== -1) {
      rawText = stdout.substring(0, splitIndex);
      const codeStr = stdout.substring(splitIndex + statusMarker.length).trim();
      statusCode = parseInt(codeStr, 10) || 200;
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = rawText;
    }

    return {
      status: statusCode,
      data: parsedData,
      rawText
    };
  } catch (err: any) {
    throw new Error(`HTTP request failed: ${err.message || String(err)}`);
  }
}
