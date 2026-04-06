export interface Field {
  id: string;
  label: string;
  value: string;
}

export interface SectionDetails {
  id: string;
  title: string;
  type: 'details';
  fields: Field[];
}

export interface SectionList {
  id: string;
  title: string;
  type: 'list';
  items: string[];
}

export type Section = SectionDetails | SectionList;

export interface BioData {
  imageUrl?: string;
  summary?: string;
  sections: Section[];
}

export const INITIAL_BIO_DATA: BioData = {
  imageUrl: undefined,
  summary: "",
  sections: [
    {
      id: "personal-details",
      title: "Personal Details",
      type: "details",
      fields: [
        { id: "1", label: "Name", value: "ISRAT JAHAN LIZA" },
        { id: "2", label: "Date of Birth", value: "14/05/2002" },
        { id: "3", label: "Height", value: "5 feet" },
        { id: "4", label: "Blood Group", value: "A+" },
        { id: "5", label: "Religion", value: "Muslim" },
        { id: "6", label: "Occupation", value: "STUDENT" },
        { id: "7", label: "Birth Place", value: "GHONAR CHALA, SAKHIPUR, TANGAIL" }
      ]
    },
    {
      id: "education",
      title: "Education",
      type: "list",
      items: [
        "SSC Passing Year: 2019, From Madrasha Board (GPA 4.78)",
        "HSC Passing Year: 2021 (GPA 5.00) BAF Shaheen School and College Paharkanchanpur",
        "Honours 3rd Year Running, Math Department of KUMUDINI GOVT. COLLEGE, TANGAIL"
      ]
    },
    {
      id: "family-details",
      title: "Family Details",
      type: "details",
      fields: [
        { id: "8", label: "Father's Name", value: "MD. LIAKAT HOSEN" },
        { id: "9", label: "Father's Occupation", value: "Assistant Teacher of Maddha Ghonar Chala Azgaria Adarsha Dakhil Madrasha" },
        { id: "10", label: "Mother's Name", value: "Farida Khatun" },
        { id: "11", label: "Mother's Occupation", value: "Assistant Teacher of Ghonar Chala Government Primary School" },
        { id: "12", label: "Elder Brother", value: "Imran hosen Fardin (Student)" }
      ]
    },
    {
      id: "contact-details",
      title: "Contact Details",
      type: "details",
      fields: [
        { id: "13", label: "Mobile Number", value: "01749646433" },
        { id: "14", label: "Address", value: "Ghonar Chala, Sakhipur, Tangail" }
      ]
    }
  ]
};