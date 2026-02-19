export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // from relation
  phone: string;
  designation: string;
  qualification: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  joiningDate: string;
  user?: {
    email: string;
    status: string;
  };
  assignedSection?: {
    name: string;
    class: {
      name: string;
      numericValue: number;
    };
  };
};
