import type { IMediaProcessingService } from '../../domain/interfaces.js';

export class MediaProcessingService implements IMediaProcessingService {
  createMultipartBody(
    imageData: Uint8Array,
    fileName: string,
    fileType: string,
  ): {data: Uint8Array; boundary: string} {
    const boundary =
      '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
    const CRLF = '\r\n';

    const preamble =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
      `Content-Type: ${fileType}${CRLF}${CRLF}`;

    const postamble = `${CRLF}--${boundary}--${CRLF}`;

    const preambleBytes = this.asciiEncode(preamble);
    const postambleBytes = this.asciiEncode(postamble);

    const body = new Uint8Array(
      preambleBytes.length + imageData.length + postambleBytes.length,
    );

    body.set(preambleBytes, 0);
    body.set(imageData, preambleBytes.length);
    body.set(postambleBytes, preambleBytes.length + imageData.length);

    return { data: body, boundary };
  }

  private asciiEncode(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i) & 0x7f;
    }
    return arr;
  }
}
