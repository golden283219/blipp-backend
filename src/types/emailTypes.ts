export enum EmailSubjectTypes {
  REPORT = 'Report',
  RECEIPT = 'Receipt',
}

export type EmailSubjectUnion =
  | EmailSubjectTypes.REPORT
  | EmailSubjectTypes.RECEIPT;
