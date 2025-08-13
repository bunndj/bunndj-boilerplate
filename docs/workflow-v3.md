# **DJ Wedding Planning App - Updated Project Scope v3**

## **Core Concept**
A focused planning application to replace Bunn DJ Company's current portal. **Not a CRM** - specifically designed for wedding event planning with PDF processing, email integration, and mobile-optimized DJ dashboard for event management.

## **Phase 1: MVP (Current Focus)**

### **Core Features:**
1. **PDF Processing System**
   - Upload wedding planner PDFs
   - AI extraction of planning data
   - Manual review and editing interface
   - Data organization into planning forms

2. **Email Integration**
   - Forward client emails to events
   - Parse email content for relevant information
   - Organize correspondence by event

3. **DJ Dashboard (iPad-Optimized)**
   - Event overview and management
   - Real-time editing during events
   - Drag-and-drop timeline reordering
   - Quick access to client information
   - Mobile-responsive design for tablets

4. **Basic Event Management**
   - Create/edit events
   - Venue information
   - Timeline management
   - Status tracking

### **Music Integration (Phase 1)**
- **Spotify playlist input**
- **Basic music timeline organization**
- **Integration planning for Crate Hackers API**

## **Phase 2: Client Interaction (Future)**

### **AI-Driven Client Questionnaire**
- **Decision tree flow** for clients without wedding planners
- **Conversational interface** to gather planning details
- **Smart questioning** based on previous responses
- **Data integration** with existing planning forms

### **Enhanced Client Features**
- **Client portal access** (invitation-based)
- **Progress tracking** for clients
- **Direct communication** with DJs

## **Updated Technical Priorities:**

### **1. Mobile-First Design**
- **iPad-optimized interface** for DJ use during events
- **Touch-friendly controls** for timeline editing
- **Offline capability** for event day use
- **Fast loading** and responsive design

### **2. API Integrations**
- **Crate Hackers API** for Spotify playlist conversion
- **Sorado integration** for DJ software compatibility
- **OpenAI API** for PDF and email parsing

### **3. User Experience Focus**
- **Simplified workflow** - avoid CRM complexity
- **Event-centric design** - everything revolves around individual events
- **Quick editing** - easy changes during live events
- **Minimal learning curve** - replace existing portal seamlessly

## **Updated User Flows:**

### **DJ Workflow (Phase 1)**
1. **Create event** → Upload client PDFs → AI processes data
2. **Review parsed information** → Edit/verify details
3. **Add client emails** → System extracts relevant info
4. **Organize music** → Import Spotify playlists
5. **Event day** → Use iPad interface for real-time management

### **Admin Workflow**
1. **Manage DJ accounts**
2. **Monitor system usage**
3. **Support and maintenance**

## **Key Deliverables:**

### **Phase 1 MVP:**
- ✅ PDF upload and AI processing
- ✅ Email forwarding and parsing
- ✅ iPad-optimized DJ dashboard
- ✅ Event management system
- ✅ Basic music integration
- ✅ Admin user management

### **Phase 2 (Future):**
- ⏳ Client questionnaire system
- ⏳ Advanced music platform integration
- ⏳ Enhanced client portal
- ⏳ Advanced reporting features

## **Scope Boundaries (What We're NOT Building):**
- ❌ **CRM functionality** (client relationship management)
- ❌ **Booking/payment systems**
- ❌ **Inventory management**
- ❌ **Staff scheduling**
- ❌ **Marketing tools**
- ❌ **Complex business analytics**

## **Database Structure (Updated for Phase 1 Focus)**

### **Users Table (DJs + Admin)**
```
- id
- name
- email
- password
- organization (nullable)
- website (nullable)
- home_phone, cell_phone, work_phone, fax_phone (nullable)
- address, address_line_2, city, state, zipcode (nullable)
- username (unique)
- role (enum: 'admin', 'dj') - default: 'dj'
- sms_consent (boolean, default: true)
- is_active (boolean, default: true)
- created_at, updated_at
```

### **Events Table**
```
- id
- name (nullable)
- event_type (enum: 'Wedding', 'Corporate', 'Birthday', 'Other')
- event_date
- setup_time, start_time, end_time (nullable)
- booking_status (enum: 'Planning', 'Booked', 'Confirmed', 'Completed')
- service_package, service_description (nullable)
- guest_count (nullable)
- dj_id (foreign key - DJ who created)
- venue_name, venue_address, venue_city, venue_state, venue_zipcode
- venue_phone, venue_email (nullable)
- created_at, updated_at
```

### **Event_Documents Table**
```
- id
- event_id (foreign key)
- document_type (enum: 'pdf', 'email', 'note')
- file_path
- original_filename
- file_size, mime_type (nullable)
- parsed_data (JSON)
- is_processed (boolean)
- uploaded_by (foreign key to users)
- created_at
```

### **Event_Planning_Data Table**
```
- id
- event_id (foreign key)
- field_name
- field_value (nullable)
- source (enum: 'manual', 'ai_parsed')
- verified_by (foreign key to users, nullable)
- created_at, updated_at
```

### **Event_Music Table**
```
- id
- event_id (foreign key)
- music_type (enum: 'spotify', 'dj_catalog')
- playlist_url (nullable)
- song_list (JSON, nullable)
- timeline_position (nullable)
- notes (nullable)
- created_at, updated_at
```

## **User Interface Flow (iPad-Optimized)**

### **Authentication Pages**
- `/signin` - Universal login
- `/admin/signup` - Admin registration (restricted)

### **Admin Pages**
- `/admin/dashboard` - Admin overview
- `/admin/djs` - Manage DJ accounts
- `/admin/events` - View all events
- `/admin/reports` - System reports

### **DJ Pages (Mobile-Optimized)**
- `/dashboard` - Events overview (tablet-friendly)
- `/events/create` - Create new event
- `/events/[id]` - Event details & planning
- `/events/[id]/documents` - Upload & manage documents
- `/events/[id]/planning` - Planning forms & AI-parsed data
- `/events/[id]/music` - Music management
- `/events/[id]/timeline` - Live timeline editing (drag-drop)
- `/profile` - Update profile

## **Development Phases**

### **Phase 1: Core MVP (Current)**
1. **Week 1-2**: Complete database & models ✅
2. **Week 3-4**: PDF upload & AI processing system
3. **Week 5-6**: iPad-optimized DJ dashboard
4. **Week 7-8**: Email integration & parsing
5. **Week 9-10**: Music management & basic integrations
6. **Week 11-12**: Testing & refinement

### **Phase 2: Client Interaction (Future)**
- AI questionnaire system
- Client portal development
- Advanced music integrations
- Enhanced mobile features

## **Success Metrics for Phase 1:**
- ✅ **PDF Processing**: 90%+ accuracy in data extraction
- ✅ **Mobile Performance**: <3 second load times on iPad
- ✅ **User Adoption**: Easy migration from current portal
- ✅ **Time Savings**: 50%+ reduction in manual data entry
- ✅ **Event Management**: Streamlined timeline editing during events

This focused scope ensures we deliver a valuable replacement for the current portal while maintaining clear boundaries and avoiding scope creep into CRM territory.
