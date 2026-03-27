import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds the allowed limit'
        : exception.message || 'File upload error';

    const error = new BadRequestException(message);
    const payload = error.getResponse();

    response.status(error.getStatus()).json(
      typeof payload === 'string'
        ? {
            statusCode: error.getStatus(),
            message: payload,
            error: 'Bad Request',
          }
        : payload,
    );
  }
}
