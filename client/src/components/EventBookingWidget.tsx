import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Search,
  GraduationCap,
  Cake,
  Bike,
  Dumbbell,
  Trophy,
  Home,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Plus,
  Heart,
  Baby,
  Music,
  Mountain,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";

const eventTypes = [
  { id: "reunions", label: "Reunions", icon: GraduationCap },
  { id: "birthdays", label: "Birthdays", icon: Cake },
  { id: "rides", label: "Group Rides", icon: Bike },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "family", label: "Family", icon: Home },
  { id: "weddings", label: "Weddings", icon: Heart },
  { id: "baby-showers", label: "Baby Showers", icon: Baby },
  { id: "music", label: "Music Events", icon: Music },
  { id: "treks", label: "Treks", icon: Mountain },
];

const cities = [
  // Major Cities
  "Agra", "Ahmedabad", "Ajmer", "Aligarh", "Allahabad", "Amritsar", "Aurangabad",
  "Bangalore", "Bareilly", "Bhopal", "Bhubaneswar", "Bikaner",
  "Chandigarh", "Chennai", "Coimbatore", "Cuttack",
  "Dehradun", "Delhi", "Dhanbad", "Durgapur",
  "Faridabad", "Firozabad",
  "Ghaziabad", "Goa", "Gorakhpur", "Gurgaon", "Guwahati", "Gwalior",
  "Hubli", "Hyderabad", "Indore",
  "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamshedpur", "Jhansi", "Jodhpur",
  "Kanpur", "Kochi", "Kolkata", "Kota",
  "Lucknow", "Ludhiana",
  "Madurai", "Mangalore", "Meerut", "Mumbai", "Mysore",
  "Nagpur", "Nashik", "Navi Mumbai", "Noida",
  "Patna", "Pondicherry", "Pune",
  "Raipur", "Rajkot", "Ranchi",
  "Salem", "Siliguri", "Srinagar", "Surat",
  "Thane", "Thiruvananthapuram", "Tiruchirappalli", "Tiruppur", "Udaipur",
  "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal",
  // Small Towns & Villages - North India
  "Rishikesh", "Haridwar", "Mussoorie", "Nainital", "Almora", "Pithoragarh", "Rudraprayag",
  "Mathura", "Vrindavan", "Ayodhya", "Chitrakoot", "Mirzapur", "Sultanpur", "Azamgarh",
  "Moradabad", "Saharanpur", "Muzaffarnagar", "Shamli", "Baghpat", "Bulandshahr",
  "Hathras", "Etah", "Mainpuri", "Etawah", "Farrukhabad", "Kannauj", "Hardoi",
  "Sitapur", "Lakhimpur", "Bahraich", "Shravasti", "Balrampur", "Gonda", "Basti",
  "Deoria", "Kushinagar", "Maharajganj", "Siddharthnagar", "Sant Kabir Nagar",
  "Ambala", "Karnal", "Panipat", "Sonipat", "Rohtak", "Jhajjar", "Rewari", "Mahendragarh",
  "Bhiwani", "Hisar", "Fatehabad", "Sirsa", "Jind", "Kaithal", "Kurukshetra", "Yamunanagar",
  "Panchkula", "Bathinda", "Moga", "Muktsar", "Fazilka", "Ferozepur", "Kapurthala",
  "Hoshiarpur", "Gurdaspur", "Pathankot", "Nawanshahr", "Rupnagar", "Fatehgarh Sahib",
  "Barnala", "Sangrur", "Mansa", "Patiala", "Mohali",
  // Rajasthan Towns
  "Pushkar", "Chittorgarh", "Bundi", "Jhalawar", "Kumbhalgarh", "Ranakpur", "Nathdwara",
  "Kishangarh", "Beawar", "Bhilwara", "Tonk", "Sawai Madhopur", "Karauli", "Dholpur",
  "Bharatpur", "Alwar", "Dausa", "Sikar", "Jhunjhunu", "Churu", "Nagaur", "Pali",
  "Jalore", "Sirohi", "Banswara", "Dungarpur", "Pratapgarh", "Rajsamand", "Hanumangarh",
  "Sri Ganganagar", "Barmer", "Jaisalmer",
  // Bihar & Jharkhand Towns
  "Gaya", "Nalanda", "Rajgir", "Bodh Gaya", "Sasaram", "Buxar", "Chapra", "Siwan",
  "Gopalganj", "Motihari", "Bettiah", "Muzaffarpur", "Sitamarhi", "Madhubani", "Darbhanga",
  "Samastipur", "Begusarai", "Khagaria", "Munger", "Bhagalpur", "Banka", "Katihar",
  "Purnia", "Kishanganj", "Araria", "Supaul", "Madhepura", "Saharsa", "Hazaribagh",
  "Giridih", "Deoghar", "Godda", "Dumka", "Pakur", "Sahebganj", "Bokaro", "Ramgarh",
  "Chatra", "Koderma", "Lohardaga", "Gumla", "Simdega", "Khunti", "Saraikela",
  // West Bengal Towns
  "Darjeeling", "Kalimpong", "Kurseong", "Jalpaiguri", "Cooch Behar", "Alipurduar",
  "Malda", "Raiganj", "Balurghat", "Murshidabad", "Berhampore", "Krishnanagar", "Kalyani",
  "Barasat", "Basirhat", "Bongaon", "Barrackpore", "Hooghly", "Chandannagar", "Serampore",
  "Rishra", "Uttarpara", "Howrah", "Uluberia", "Kharagpur", "Midnapore", "Tamluk",
  "Haldia", "Contai", "Digha", "Bankura", "Bishnupur", "Purulia", "Asansol", "Bardhaman",
  // Northeast Towns
  "Shillong", "Cherrapunji", "Mawsynram", "Tura", "Jowai", "Nongpoh", "Imphal", "Thoubal",
  "Bishnupur", "Churachandpur", "Ukhrul", "Aizawl", "Lunglei", "Champhai", "Serchhip",
  "Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto", "Agartala", "Udaipur",
  "Dharmanagar", "Kailashahar", "Itanagar", "Naharlagun", "Pasighat", "Along", "Ziro",
  "Tawang", "Bomdila", "Tezpur", "Jorhat", "Dibrugarh", "Tinsukia", "Sibsagar", "Nagaon",
  "Barpeta", "Nalbari", "Bongaigaon", "Dhubri", "Goalpara", "Silchar", "Karimganj",
  // Gujarat Towns
  "Dwarka", "Somnath", "Porbandar", "Junagadh", "Veraval", "Amreli", "Bhavnagar",
  "Palitana", "Diu", "Bhuj", "Mandvi", "Gandhidham", "Anjar", "Kutch", "Surendranagar",
  "Morbi", "Gondal", "Jetpur", "Upleta", "Jamnagar", "Mehsana", "Palanpur", "Patan",
  "Siddhpur", "Gandhinagar", "Nadiad", "Anand", "Kheda", "Dahod", "Godhra", "Bharuch",
  "Ankleshwar", "Navsari", "Valsad", "Vapi", "Daman", "Silvassa",
  // Maharashtra Towns
  "Shirdi", "Lonavala", "Khandala", "Mahabaleshwar", "Panchgani", "Matheran", "Alibaug",
  "Ratnagiri", "Ganpatipule", "Malvan", "Sawantwadi", "Kolhapur", "Sangli", "Satara",
  "Karad", "Pandharpur", "Solapur", "Osmanabad", "Latur", "Nanded", "Parbhani", "Hingoli",
  "Washim", "Akola", "Amravati", "Yavatmal", "Wardha", "Chandrapur", "Gadchiroli", "Gondia",
  "Bhandara", "Jalgaon", "Dhule", "Nandurbar", "Ahmednagar", "Shrirampur", "Sangamner",
  // Madhya Pradesh Towns
  "Khajuraho", "Orchha", "Sanchi", "Ujjain", "Omkareshwar", "Maheshwar", "Mandu",
  "Pachmarhi", "Amarkantak", "Chitrakoot", "Rewa", "Satna", "Shahdol", "Mandla", "Seoni",
  "Balaghat", "Chhindwara", "Betul", "Hoshangabad", "Harda", "Khandwa", "Burhanpur",
  "Dewas", "Shajapur", "Rajgarh", "Vidisha", "Sagar", "Damoh", "Tikamgarh", "Chhatarpur",
  "Panna", "Datia", "Shivpuri", "Guna", "Ashoknagar", "Neemuch", "Mandsaur", "Ratlam",
  // South India Towns
  "Ooty", "Kodaikanal", "Munnar", "Thekkady", "Alleppey", "Kumarakom", "Kovalam", "Varkala",
  "Wayanad", "Kozhikode", "Kannur", "Kasaragod", "Thrissur", "Palakkad", "Malappuram",
  "Tirunelveli", "Kanyakumari", "Rameswaram", "Thanjavur", "Kumbakonam", "Chidambaram",
  "Mamallapuram", "Kanchipuram", "Vellore", "Tiruvannamalai", "Krishnagiri", "Dharmapuri",
  "Erode", "Namakkal", "Karur", "Dindigul", "Theni", "Virudhunagar", "Sivakasi", "Rajapalayam",
  "Hampi", "Badami", "Aihole", "Pattadakal", "Bijapur", "Gulbarga", "Bidar", "Raichur",
  "Bellary", "Hospet", "Chitradurga", "Davangere", "Shimoga", "Udupi", "Karwar", "Gokarna",
  "Murdeshwar", "Coorg", "Chikmagalur", "Hassan", "Belur", "Halebidu", "Sravanabelagola",
  "Tirupati", "Tirumala", "Srikalahasti", "Nellore", "Ongole", "Guntur", "Tenali", "Narasaraopet",
  "Machilipatnam", "Eluru", "Rajahmundry", "Kakinada", "Peddapuram", "Amalapuram",
  "Anantapur", "Kadapa", "Kurnool", "Nandyal", "Adoni", "Chittoor", "Madanapalle",
  // Odisha Towns
  "Puri", "Konark", "Chilika", "Gopalpur", "Berhampur", "Jeypore", "Koraput", "Rayagada",
  "Sambalpur", "Rourkela", "Sundargarh", "Jharsuguda", "Bargarh", "Bolangir", "Sonepur",
  "Balangir", "Phulbani", "Baripada", "Balasore", "Bhadrak", "Kendrapara", "Jagatsinghpur",
  // Chhattisgarh Towns
  "Jagdalpur", "Kondagaon", "Kanker", "Dantewada", "Bijapur", "Sukma", "Narayanpur",
  "Korba", "Bilaspur", "Durg", "Bhilai", "Rajnandgaon", "Kawardha", "Mahasamund", "Gariaband",
  // Himachal & Uttarakhand Towns
  "Shimla", "Manali", "Kullu", "Dharamshala", "McLeodganj", "Dalhousie", "Khajjiar",
  "Kasauli", "Chail", "Kufri", "Solan", "Bilaspur", "Hamirpur", "Una", "Kangra", "Palampur",
  "Mandi", "Sundernagar", "Keylong", "Spiti", "Kaza", "Kinnaur", "Kalpa", "Sarahan",
  "Badrinath", "Kedarnath", "Gangotri", "Yamunotri", "Uttarkashi", "Joshimath", "Auli",
  "Chopta", "Tungnath", "Ranikhet", "Kausani", "Binsar", "Mukteshwar", "Bhimtal", "Sattal",
  // Jammu & Kashmir Towns
  "Gulmarg", "Pahalgam", "Sonamarg", "Patnitop", "Vaishno Devi", "Katra", "Udhampur",
  "Rajouri", "Poonch", "Anantnag", "Shopian", "Pulwama", "Budgam", "Baramulla", "Kupwara",
  "Leh", "Kargil", "Nubra", "Pangong", "Turtuk", "Diskit", "Hunder", "Lamayuru", "Alchi"
];

export default function EventBookingWidget() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedEventType, setSelectedEventType] = useState("reunions");
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [findLocationSearch, setFindLocationSearch] = useState("");
  const [showFindLocationSuggestions, setShowFindLocationSuggestions] = useState(false);
  const [attendees, setAttendees] = useState("10-20");
  const [showAllEventTypes, setShowAllEventTypes] = useState(false);

  const visibleEventTypes = showAllEventTypes ? eventTypes : eventTypes.slice(0, 6);

  // Filter cities based on search input
  const filteredCities = locationSearch.trim() 
    ? cities.filter(city => city.toLowerCase().includes(locationSearch.toLowerCase())).slice(0, 8)
    : cities.slice(0, 8);

  const filteredFindCities = findLocationSearch.trim()
    ? cities.filter(city => city.toLowerCase().includes(findLocationSearch.toLowerCase())).slice(0, 8)
    : cities.slice(0, 8);

  const handleSelectCity = (city: string) => {
    setLocation(city);
    setLocationSearch(city);
    setShowLocationSuggestions(false);
  };

  const handleSelectFindCity = (city: string) => {
    setFindLocationSearch(city);
    setShowFindLocationSuggestions(false);
  };

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleFindEvents = () => {
    navigate("/events");
  };

  const handleSplitExpenses = () => {
    navigate("/split-expenses");
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm" data-testid="card-booking-widget">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-auto p-0 gap-0">
            <TabsTrigger 
              value="create" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-create-event"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger 
              value="find" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-find-events"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Find Events</span>
              <span className="sm:hidden">Find</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-split-expenses"
            >
              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Split Expenses</span>
              <span className="sm:hidden">Split</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="pt-2 pb-4 px-4 sm:pt-3 sm:pb-6 sm:px-6 space-y-3 sm:space-y-4 mt-0 min-h-[280px] sm:min-h-[220px]">
            <div className="flex flex-wrap gap-2 pb-3 border-b">
              {visibleEventTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedEventType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEventType(type.id)}
                  className="gap-2"
                  data-testid={`button-event-type-${type.id}`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllEventTypes(!showAllEventTypes)}
                className="gap-1 text-muted-foreground"
                data-testid="button-toggle-event-types"
              >
                {showAllEventTypes ? (
                  <>
                    Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 relative">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search city..."
                    className="h-12 pl-10"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    data-testid="input-location"
                  />
                </div>
                {showLocationSuggestions && filteredCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onMouseDown={() => handleSelectCity(city)}
                        data-testid={`suggestion-city-${city}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal"
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Expected Guests</Label>
                <Select value={attendees} onValueChange={setAttendees}>
                  <SelectTrigger className="h-12" data-testid="select-attendees">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 guests</SelectItem>
                    <SelectItem value="10-20">10-20 guests</SelectItem>
                    <SelectItem value="20-50">20-50 guests</SelectItem>
                    <SelectItem value="50-100">50-100 guests</SelectItem>
                    <SelectItem value="100+">100+ guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground invisible">Action</Label>
                <Button 
                  className="w-full h-12" 
                  size="lg"
                  onClick={handleCreateEvent}
                  data-testid="button-create-event-submit"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="find" className="pt-2 pb-4 px-4 sm:pt-3 sm:pb-6 sm:px-6 space-y-3 sm:space-y-4 mt-0 min-h-[280px] sm:min-h-[220px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or type..." 
                    className="h-12 pl-10"
                    data-testid="input-search-events"
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search city..."
                    className="h-12 pl-10"
                    value={findLocationSearch}
                    onChange={(e) => {
                      setFindLocationSearch(e.target.value);
                      setShowFindLocationSuggestions(true);
                    }}
                    onFocus={() => setShowFindLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFindLocationSuggestions(false), 200)}
                    data-testid="input-find-location"
                  />
                </div>
                {showFindLocationSuggestions && filteredFindCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredFindCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onMouseDown={() => handleSelectFindCity(city)}
                        data-testid={`suggestion-find-city-${city}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground invisible">Action</Label>
                <Button 
                  className="w-full h-12" 
                  size="lg"
                  onClick={handleFindEvents}
                  data-testid="button-search-events-submit"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Events
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="pt-2 pb-4 px-4 sm:pt-3 sm:pb-6 sm:px-6 mt-0 min-h-[280px] sm:min-h-[220px]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-semibold">Split Bills Easily</h3>
                <p className="text-muted-foreground">
                  Track expenses, split costs fairly among friends, and see who owes whom. 
                  No more awkward money conversations!
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Auto-split</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Settlement suggestions</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Export PDF</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white min-w-[200px]"
                onClick={handleSplitExpenses}
                data-testid="button-try-split-expenses"
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Try Split Expenses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
