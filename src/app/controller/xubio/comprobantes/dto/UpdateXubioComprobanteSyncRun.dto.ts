import { PartialType } from '@nestjs/swagger';
import { CreateXubioComprobanteSyncRunDto } from './CreateXubioComprobanteSyncRun.dto';

export class UpdateXubioComprobanteSyncRunDto extends PartialType(CreateXubioComprobanteSyncRunDto) {}
