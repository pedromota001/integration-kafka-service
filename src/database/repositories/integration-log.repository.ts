import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntegrationLog } from '../schemas/integration-log.schema';
import { Logger } from '../../common/utils/logger.util';


@Injectable()
export class IntegrationLogRepository {
  private readonly logger = new Logger('IntegrationLogRepository');

  constructor(
    @InjectModel(IntegrationLog.name)
    private readonly logModel: Model<IntegrationLog>,
  ) {}

  async create(data: IntegrationLog): Promise<IntegrationLog> {
    try {
      const log = new this.logModel({
        eventId: this.generateEventId(),
        timestamp: new Date(),
        ...data,
      });

      const savedLog = await log.save();
      this.logger.log(`Log created: ${savedLog.eventId}`);
      return savedLog;
    } catch (error) {
      this.logger.error('Failed to create log', error);
      throw error;
    }
  }

  async update(
    eventId: string,
    updates: IntegrationLog,
  ): Promise<IntegrationLog | null> {
    try {
      const updatedLog = await this.logModel
        .findOneAndUpdate({ eventId }, updates, { new: true })
        .exec();

      if (updatedLog) {
        this.logger.log(`Log updated: ${eventId}`);
      } else {
        this.logger.warn(`Log not found: ${eventId}`);
      }
      return updatedLog;
    } catch (error) {
      this.logger.error(`Failed to update log: ${eventId}`, error);
      throw error;
    }
  }

  async findByEventId(eventId: string): Promise<IntegrationLog | null> {
    return this.logModel.findOne({ eventId }).exec();
  }

  async findRecent(options?: {
    limit?: number;
    type?: string;
    status?: string;
    direction?: string;
    source?: string;
  }): Promise<IntegrationLog[]> {
    const {
      limit = 10,
      type,
      status,
      direction,
      source,
    } = options || {};

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (direction) filter.direction = direction;
    if (source) filter.source = source;

    return this.logModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findByTimeRange(
    startDate: Date,
    endDate: Date,
  ): Promise<IntegrationLog[]> {
    return this.logModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .exec();
  }

  async countByStatus(): Promise<Record<string, number>> {
    const results = await this.logModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return results.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});
  }

  async findErrors(limit: number = 10): Promise<IntegrationLog[]> {
    return this.logModel
      .find({ status: 'error' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async count(filter?: any): Promise<number> {
    return this.logModel.countDocuments(filter || {}).exec();
  }

  async findByType(
    type: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<IntegrationLog[]> {
    const skip = (page - 1) * pageSize;

    return this.logModel
      .find({ type })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();
  }

  async getProcessingStats(): Promise<{
    avgTime: number;
    minTime: number;
    maxTime: number;
    count: number;
  }> {
    const results = await this.logModel.aggregate([
      {
        $match: {
          processingTimeMs: { $exists: true, $ne: null },
          status: 'success',
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTimeMs' },
          minTime: { $min: '$processingTimeMs' },
          maxTime: { $max: '$processingTimeMs' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (results.length === 0) {
      return { avgTime: 0, minTime: 0, maxTime: 0, count: 0 };
    }

    return {
      avgTime: Math.round(results[0].avgTime),
      minTime: results[0].minTime,
      maxTime: results[0].maxTime,
      count: results[0].count,
    };
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.logModel
      .deleteMany({
        timestamp: { $lt: date },
      })
      .exec();

    this.logger.log(`Deleted ${result.deletedCount} old logs`);
    return result.deletedCount;
  }

  private generateEventId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
