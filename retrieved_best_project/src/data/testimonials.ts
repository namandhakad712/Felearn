export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  initials?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Jane Doe',
    role: 'Author',
    initials: 'JD',
    content: 'This platform has completely transformed my creative process. I use it to overcome writer\'s block and generate new ideas for my novels. The quality of the AI-generated content is impressive!'
  },
  {
    id: '2',
    name: 'Mark Smith',
    role: 'Teacher',
    initials: 'MS',
    content: 'As an elementary school teacher, I use this platform to create engaging stories for my students. They love the imaginative tales and colorful images that bring the narratives to life.'
  },
  {
    id: '3',
    name: 'Amy Lee',
    role: 'Content Creator',
    initials: 'AL',
    content: 'The export features are fantastic! I can easily generate stories for my blog and social media channels, complete with images that match the tone and style of my brand.'
  },
  {
    id: '4',
    name: 'Robert Johnson',
    role: 'Game Developer',
    initials: 'RJ',
    content: 'I\'ve been using this platform to create backstories for characters in my indie game. It\'s saved me countless hours of writing and has given my characters depth I couldn\'t have achieved on my own.'
  },
  {
    id: '5',
    name: 'Sarah Williams',
    role: 'Marketing Director',
    initials: 'SW',
    content: 'Our marketing team uses this tool to create engaging content for our campaigns. The AI understands our brand voice perfectly and consistently delivers high-quality stories that resonate with our audience.'
  }
];