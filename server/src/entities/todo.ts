export class Todo {
  constructor(
    public id: string,
    public projectId: string,
    public description: string | null,
    public dueBy: Date | null,
    public done: boolean
  ) {}
}
