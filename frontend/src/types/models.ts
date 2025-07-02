export interface Account {
    _id: string;
    username: string;
    name: string;
    YOB: number;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Comment {
    _id: string;
    rating: number;
    content: string;
    author: Account; // Populate will give Account object
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Player {
    _id: string;
    playerName: string;
    image: string;
    cost: number;
    isCaptain: boolean;
    information: string;
    comments: Comment[];
    team: Team; // Populated will give Team object
    isActive: boolean; // For soft delete
    createdAt: string;
    updatedAt: string;
    position: string;
    rating: number;
    nationality: string;
    stats: {
      goals: number;
      assists: number;
      matches: number;
    };
  }
  
  export interface Team {
    _id: string;
    teamName: string;
    logo: string;
    createdAt: string;
    updatedAt: string;
  }