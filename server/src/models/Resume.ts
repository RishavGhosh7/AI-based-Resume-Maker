import { Schema, model, Document } from 'mongoose';

export interface IGeneratedSections {
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
}

export interface IExperienceHistory {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  achievements?: string[];
}

export interface IResume extends Document {
  userId?: string;
  sessionId?: string;
  templateType: 'fresher' | 'mid' | 'senior';
  skills: string[];
  experienceHistory: IExperienceHistory[];
  jobDescription?: string;
  generatedSections: IGeneratedSections;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    isEditable: boolean;
  };
}

const ExperienceHistorySchema = new Schema<IExperienceHistory>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
  achievements: [{ type: String }],
}, { _id: false });

const GeneratedSectionsSchema = new Schema<IGeneratedSections>({
  summary: { type: String },
  skills: { type: String },
  experience: { type: String },
  education: { type: String },
}, { _id: false });

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  templateType: { 
    type: String, 
    required: true, 
    enum: ['fresher', 'mid', 'senior'],
    default: 'fresher'
  },
  skills: [{ type: String, required: true }],
  experienceHistory: [ExperienceHistorySchema],
  jobDescription: { type: String },
  generatedSections: {
    type: GeneratedSectionsSchema,
    default: {}
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isEditable: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const transformed: any = {
        id: ret._id,
        userId: ret.userId,
        sessionId: ret.sessionId,
        templateType: ret.templateType,
        skills: ret.skills,
        experienceHistory: ret.experienceHistory,
        jobDescription: ret.jobDescription,
        generatedSections: ret.generatedSections,
        metadata: ret.metadata
      };
      return transformed;
    }
  },
  versionKey: false
});

// Index for efficient queries
ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ sessionId: 1, createdAt: -1 });
ResumeSchema.index({ templateType: 1 });

// Pre-save middleware to update the updatedAt field
ResumeSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

export const ResumeModel = model<IResume>('Resume', ResumeSchema);