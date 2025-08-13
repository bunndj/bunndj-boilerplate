# **DJ Wedding Planning App - Complete Project Scope & Database Design**

## **Core Concept**
A wedding planning application where **DJs are the only users** who manage multiple wedding events. DJs manually input event information, upload client documents, and use AI to parse planning data from various sources. The platform includes admin users who manage DJ accounts and events.

## **User Types**
- **Admin Users**: Manage the platform, create DJ accounts, oversee all events
- **DJ Users**: Manage assigned events, upload documents, use AI parsing

## **1. User Authentication & Roles**

### **Registration & Onboarding**
- **Admin Registration**: Restricted admin account creation
- **DJ Registration**: Admin creates DJ accounts
- **Universal Login**: Single login form for all users
- **Role-Based Access**: Different dashboards and permissions based on role

### **User Roles & Permissions**

#### **Admin Users**
**Privileges:**
- ✅ Create, edit, delete DJ accounts
- ✅ View all events and data
- ✅ Delete events
- ✅ Manage system settings
- ✅ Access admin dashboard
- ✅ Generate reports

#### **DJ Users**
**Privileges:**
- ✅ Create, edit, delete their own events
- ✅ Upload documents for their events
- ✅ Manage planning data for their events
- ✅ Access DJ dashboard
- ✅ Update own profile

## **2. Core Features**

### **Event Management**
- **Event Creation**: DJs create their own events with basic details
- **Event Details**: Complete event information including venue
- **Status Tracking**: Planning, confirmed, completed statuses

### **Document Upload & Processing**
- **PDF Upload**: Wedding planner documents, client notes
- **Email Integration**: Forward client emails to events
- **Note Taking**: Manual notes from meetings/calls
- **AI Parsing**: Extract relevant planning data from documents

### **Planning Forms & Data Management**
- **AI-Powered Form Filling**: Automatically populate from uploaded documents
- **Manual Review Interface**: Verify and edit parsed results
- **Manual Input**: Add missing information manually
- **Progress Tracking**: Completion percentage for each event
- **Data Export**: Generate final planning documents

### **Music Management**
- **Spotify Integration**: Client playlist links
- **Music Timeline**: Organize songs by event phase
- **DJ Music Catalog**: Professional music database
- **Client Preferences**: Track do-not-play lists, special requests

### **Timeline Management**
- **Visual Timeline**: Event schedule creation
- **Task Management**: DJ-specific tasks and reminders
- **Final Documentation**: Export complete event plans

## **3. Database Structure**

### **Users Table (DJs + Admin)**
```
- id
- name (e.g., "Joe Bond")
- organization (nullable)
- email (nullable)
- website (nullable)
- home_phone (e.g., "9197859001")
- cell_phone (nullable)
- work_phone (nullable)
- fax_phone (nullable)
- address (e.g., "410 N. Boylan Ave.")
- address_line_2 (nullable)
- city (e.g., "Raleigh")
- state (e.g., "NC")
- zipcode (e.g., "27603")
- username (e.g., "testaccount")
- password
- role (enum: 'admin', 'dj') - default: 'dj'
- sms_consent (boolean, default: true)
- is_active (boolean, default: true)
- created_at
- updated_at
```

### **Events Table**
```
- id (e.g., "6640")
- name (nullable)
- event_type (e.g., "Wedding")
- event_date (e.g., "Friday, February 12, 2027")
- setup_time (nullable)
- start_time (nullable)
- end_time (nullable)
- booking_status (e.g., "Booked")
- service_package (e.g., "Associate Package-4 hours")
- service_description (e.g., "Pricing for all Bunn DJ Company Associate DJs")
- guest_count (nullable)
- dj_id (foreign key to users - DJ who created)
- created_at
- updated_at

// Venue Information (1-to-1 relationship)
- venue_name (e.g., "Merrimon Wynne House")
- venue_address (e.g., "500 N. Blount St.")
- venue_city (e.g., "Raleigh")
- venue_state (e.g., "NC")
- venue_zipcode (e.g., "27604")
- venue_phone (e.g., "970-306-5881")
- venue_email (e.g., "jodi@merrimonwynne.com")
```

### **Event_Documents Table**
```
- id
- event_id
- document_type (pdf/email/note)
- file_path
- uploaded_at
- parsed_data (JSON)
- is_processed (boolean)
- uploaded_by (foreign key to users)
- created_at
```

### **Event_Planning_Data Table**
```
- id
- event_id
- field_name
- field_value
- source (manual/ai_parsed)
- verified_by (foreign key to users)
- created_at
- updated_at
```

### **Event_Music Table**
```
- id
- event_id
- music_type (spotify/dj_catalog)
- playlist_url (nullable)
- song_list (JSON)
- timeline_position
- notes (nullable)
- created_at
- updated_at
```

## **4. User Interface Flow**

### **Authentication Pages**
- `/signup` - Admin registration (restricted)
- `/signin` - Universal login
- `/onboarding` - Profile setup

### **Admin Pages**
- `/admin/dashboard` - Admin overview
- `/admin/djs` - Manage DJ accounts
- `/admin/events` - Manage all events
- `/admin/reports` - System reports

### **DJ Pages**
- `/dashboard` - Assigned events overview
- `/events/[id]` - Event details & planning
- `/events/[id]/documents` - Document upload & management
- `/events/[id]/planning` - Planning forms & data
- `/events/[id]/music` - Music management
- `/events/[id]/timeline` - Timeline creation
- `/profile` - Update profile

## **5. Key Features Breakdown**

### **AI Document Processing**
- **PDF Parsing**: Extract planning data from various document formats
- **Email Processing**: Parse client emails for relevant information
- **Data Mapping**: Match extracted data to planning form fields
- **Confidence Scoring**: Indicate parsing accuracy for manual review

### **Admin Management Interface**
- **DJ Management**: Create, edit, deactivate DJ accounts
- **Event Management**: View all events, delete events if needed
- **System Overview**: View all events, progress, and statistics
- **Reporting**: Generate reports on event completion, DJ performance

### **DJ Management Interface**
- **Event Overview**: All their own events with status and progress
- **Event Creation**: Create new events with basic details
- **Document Management**: Upload, review, and organize client materials
- **Data Verification**: Review AI-parsed results and make corrections
- **Manual Input**: Add any information not captured by AI
- **Final Export**: Generate complete event documentation

## **6. Development Phases**

### **Phase 1: Core Platform**
- User authentication and role management
- Admin and DJ dashboards
- Basic user management (admin creates DJ accounts)

### **Phase 2: Event Management**
- Event creation by DJs
- Basic event details and venue information
- Event status tracking

### **Phase 3: Document Management**
- File upload system
- Document organization and storage
- Basic document viewing

### **Phase 4: AI Integration**
- PDF parsing with AI
- Data extraction and mapping
- Manual review interface

### **Phase 5: Planning Forms**
- Planning form management
- Manual data input
- Progress tracking

### **Phase 6: Music & Timeline**
- Music management system
- Timeline creation tools
- Final documentation export

## **7. Technical Requirements**

### **Backend (Laravel)**
- User authentication and role-based authorization
- File upload and storage
- AI API integration (OpenAI)
- Email processing system
- Data export functionality
- Admin management system

### **Frontend (React)**
- Admin dashboard and management interface
- DJ dashboard and event management
- Document upload and review
- Planning form management
- Timeline creation tools

### **External Integrations**
- **OpenAI API**: Document parsing and data extraction
- **Email Service**: Process forwarded client emails
- **File Storage**: Secure document storage
- **Spotify API**: Playlist link processing

## **8. Key Benefits**

### **For Admins**
- **Centralized Management**: Control over all DJs
- **System Oversight**: Complete visibility into all operations
- **Event Monitoring**: View and manage all events
- **Reporting**: Comprehensive system analytics

### **For DJs**
- **Focused Work**: Only see assigned events
- **AI-Powered Efficiency**: Automatic data extraction from documents
- **Professional Documentation**: Clean, organized event plans
- **Time Savings**: Reduce manual data entry

## **9. User Workflows**

### **Admin Workflow**
1. Create DJ accounts
2. Monitor all events and DJs
3. Delete events if needed
4. Generate reports and analytics

### **DJ Workflow**
1. Create their own events
2. Upload client documents and notes
3. Review AI-parsed data
4. Add missing information manually
5. Complete event planning and documentation

This simplified scope focuses on admin-DJ management with AI-powered document processing, creating an efficient system for wedding event planning.
