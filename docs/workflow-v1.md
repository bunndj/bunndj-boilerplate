# **Complete MVP User Flow & Project Structure**

## **1. User Authentication Flow**

### **Universal Registration/Login**
- **Single signup form**: Name, email, password
- **Single login form**: Email, password
- **No user type selection** during registration

### **First-Time Onboarding (After Login)**
1. **Welcome screen**: "Welcome! Let's get you set up"
2. **User type selection**: 
   - "I'm planning a wedding" (Couple)
   - "I'm a DJ" (DJ)
3. **One-time setup** - determines user capabilities

## **2. Couples User Flow**

### **Onboarding**
1. **Select "I'm planning a wedding"**
2. **Create first event**: Event name, wedding date
3. **Dashboard access**

### **Main App Flow**
1. **Dashboard**: View all events, invited DJs
2. **Create Event**: Simple form (name, date)
3. **Invite DJ**: Enter DJ email + optional message
4. **Event Planning**: Chat-like interface for planning
5. **Music Management**: Upload Spotify playlists
6. **Timeline**: View/manage event timeline

### **DJ Invitation Process**
1. **Enter DJ email** in invitation form
2. **System sends email** with invitation link
3. **Track invitation status** (pending, accepted, declined)

## **3. DJs User Flow**

### **Onboarding**
1. **Select "I'm a DJ"**
2. **Basic profile**: Company name (optional)
3. **Dashboard access**

### **Main App Flow**
1. **Dashboard**: View all invited events
2. **Accept/Decline invitations** via email
3. **Event Access**: Only see events they're invited to
4. **Event Planning**: Same tools as couples
5. **Client Communication**: Chat with couples
6. **Timeline Management**: Manage event timelines

### **Invitation Acceptance**
1. **Receive email** with invitation link
2. **Click link** → Redirected to signup/login
3. **If new user**: Signup → Onboarding → Join event
4. **If existing user**: Login → Join event

## **4. Core Features Flow**

### **Event Creation (Couples Only)**
- Event name
- Wedding date
- Optional: Venue, guest count
- **Result**: Event created, couple becomes owner

### **DJ Invitation (Couples Only)**
- Enter DJ email address
- Optional personal message
- **Result**: Email sent, invitation tracked

### **Event Planning (Both Users)**
- **Chat-like interface** for Q&A
- **PDF upload** and parsing
- **Form completion** based on chat responses
- **Progress tracking** (percentage complete)

### **Music Management (Both Users)**
- **Spotify playlist links** (no authentication needed)
- **DJ music catalog** for selection
- **Music timeline** planning

### **Timeline Management (Both Users)**
- **Visual timeline** creation
- **Event scheduling**
- **Task management**

## **5. Database Structure**

### **Users Table**
```
- id
- name
- email
- password
- user_type (couple/dj)
- company_name (nullable)
- is_onboarded (boolean)
- created_at
- updated_at
```

### **Events Table**
```
- id
- name
- date
- venue (nullable)
- guest_count (nullable)
- couple_id (foreign key)
- status (planning/confirmed/completed)
- created_at
- updated_at
```

### **Event_DJs Table** (Many-to-Many)
```
- id
- event_id
- dj_id
- status (pending/accepted/declined)
- invited_at
- accepted_at
```

### **Event_Planning Table**
```
- id
- event_id
- field_name
- field_value
- completed_at
```

## **6. User Interface Flow**

### **Authentication Pages**
- `/signup` - Universal registration
- `/signin` - Universal login
- `/onboarding` - User type selection (first time only)

### **Couples Pages**
- `/dashboard` - Events overview
- `/events/create` - Create new event
- `/events/[id]` - Event details & planning
- `/events/[id]/invite` - Invite DJs
- `/events/[id]/music` - Music management
- `/events/[id]/timeline` - Timeline management

### **DJs Pages**
- `/dashboard` - Invited events overview
- `/events/[id]` - Event details & planning
- `/events/[id]/music` - Music management
- `/events/[id]/timeline` - Timeline management

### **Shared Pages**
- `/profile` - User profile management
- `/events/[id]/chat` - Planning chat interface

## **7. Email Notifications**

### **DJ Invitation Email**
- Subject: "You're invited to plan [Event Name]"
- Content: Event details, couple name, invitation link
- CTA: "Join Event" button

### **Invitation Status Updates**
- "DJ accepted your invitation"
- "DJ declined your invitation"

## **8. Security & Permissions**

### **Access Control**
- Couples can only see their own events
- DJs can only see events they're invited to
- Event data isolation between different couples

### **Invitation Security**
- Time-limited invitation links (7 days)
- Secure tokens for invitation validation
- Email verification for new accounts

## **9. Development Phases**

### **Phase 1: Core Authentication**
- User registration/login
- Onboarding flow
- User type determination

### **Phase 2: Event Management**
- Event creation (couples)
- Basic event details
- Event ownership

### **Phase 3: DJ Invitation System**
- Email invitation system
- Invitation acceptance flow
- Event access control

### **Phase 4: Planning Interface**
- Chat-like planning interface
- Form completion system
- Progress tracking

### **Phase 5: Music & Timeline**
- Spotify integration
- Timeline management
- Music catalog

## **10. Key User Journeys**

### **New Couple Journey**
1. Sign up → Onboarding (select couple) → Create event → Invite DJ → Start planning

### **New DJ Journey**
1. Receive invitation → Sign up → Onboarding (select DJ) → Join event → Access planning tools

### **Existing DJ Journey**
1. Receive invitation → Sign in → Join event → Access planning tools

This flow ensures a smooth, intuitive experience for both user types while maintaining security and simplicity for the MVP.

