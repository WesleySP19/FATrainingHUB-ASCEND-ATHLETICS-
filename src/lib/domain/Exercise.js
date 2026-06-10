export class Exercise {
  constructor({ id, name, category, subCategory, mechanics, visualGuideline }) {
    this.id = id;
    this.name = name;
    this.category = category; // e.g. Football, Powerlifting, Rugby
    this.subCategory = subCategory; // e.g. OL/DL, Forwards, Força Base
    this.mechanics = mechanics; // Technical mechanics and instructions
    this.visualGuideline = visualGuideline; // Guidelines/Paths for chalkboards
  }

  static fromPrisma(prismaEx) {
    if (!prismaEx) return null;
    return new Exercise({
      id: prismaEx.id,
      name: prismaEx.name,
      category: prismaEx.type,
      subCategory: prismaEx.location,
      mechanics: prismaEx.description,
      visualGuideline: prismaEx.mediaUrl
    });
  }
}
