
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const { path, operation } = context;
    const message = `FirestoreError: Missing or insufficient permissions: 
The following request was denied by Firestore Security Rules:
{ "path": "${path}", "operation": "${operation}" }`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
