# **Database Design v1 - DJ Wedding Planning App**

## **Overview**
This document outlines the finalized database structure for the DJ Wedding Planning application with separate tables for planning data and music ideas, using JSON storage for flexible data management.

## **Database Schemas**

### **1. Users Table**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Contact Information
    organization VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    home_phone VARCHAR(255) NULL,
    cell_phone VARCHAR(255) NULL,
    work_phone VARCHAR(255) NULL,
    fax_phone VARCHAR(255) NULL,
    
    -- Address Information
    address VARCHAR(255) NULL,
    address_line_2 VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    state VARCHAR(255) NULL,
    zipcode VARCHAR(255) NULL,
    
    -- User Management
    username VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'dj') DEFAULT 'dj',
    sms_consent BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **2. Events Table**
```sql
CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Event Basic Information
    name VARCHAR(255) NULL,
    event_type ENUM('Wedding', 'Corporate', 'Birthday', 'Other') DEFAULT 'Wedding',
    event_date DATE NOT NULL,
    setup_time TIME NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    booking_status ENUM('Planning', 'Booked', 'Confirmed', 'Completed') DEFAULT 'Planning',
    
    -- Service Information
    service_package VARCHAR(255) NULL,
    service_description TEXT NULL,
    guest_count INT NULL,
    
    -- DJ Relationship
    dj_id BIGINT NOT NULL,
    
    -- Venue Information (1-to-1 relationship)
    venue_name VARCHAR(255) NULL,
    venue_address VARCHAR(255) NULL,
    venue_city VARCHAR(255) NULL,
    venue_state VARCHAR(255) NULL,
    venue_zipcode VARCHAR(255) NULL,
    venue_phone VARCHAR(255) NULL,
    venue_email VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dj_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **3. Event_Planning Table (One-to-One with Events)**
```sql
CREATE TABLE event_planning (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    planning_data JSON NULL,
    notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_planning (event_id)
);
```

### **4. Event_Documents Table**
```sql
CREATE TABLE event_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    document_type ENUM('pdf', 'email', 'note') DEFAULT 'pdf',
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size VARCHAR(255) NULL,
    mime_type VARCHAR(255) NULL,
    parsed_data JSON NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    uploaded_by BIGINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### **5. Event_Music_Ideas Table (One-to-One with Events)**
```sql
CREATE TABLE event_music_ideas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    music_ideas JSON NULL,
    notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_music (event_id)
);
```

## **JSON Structure Examples**

### **Planning Data JSON (in event_planning.planning_data):**
```json
[
    {
        "field_name": "first_dance_song",
        "field_value": "At Last by Etta James"
    },
    {
        "field_name": "ceremony_start_time", 
        "field_value": "4:00 PM"
    },
    {
        "field_name": "guest_count",
        "field_value": "150"
    },
    {
        "field_name": "cocktail_hour_duration",
        "field_value": "1 hour"
    },
    {
        "field_name": "reception_end_time",
        "field_value": "11:00 PM"
    }
]
```

### **Music Ideas JSON (in event_music_ideas.music_ideas):**
```json
{
    "must_play": [
        {
            "music_type": "individual_song",
            "artist": "Britney Spears",
            "song": "Oops!... I Did It Again"
        },
        {
            "music_type": "spotify",
            "playlist": "https://open.spotify.com/playlist/xyz123"
        },
        {
            "music_type": "individual_song",
            "artist": "Michael Jackson",
            "song": "Billie Jean"
        }
    ],
    "play_if_possible": [
        {
            "music_type": "individual_song",
            "artist": "Chris Brown", 
            "song": "Forever"
        },
        {
            "music_type": "spotify",
            "playlist": "https://open.spotify.com/playlist/abc456"
        }
    ]
}
```

## **Table Relationships**

### **Relationship Diagram:**
```
┌─────────────┐
│   USERS     │
│             │
│ - id        │
│ - role      │
│ - name      │
└─────────────┘
       │
       │ (One-to-Many)
       ▼
┌─────────────┐
│   EVENTS    │ (Master table)
│             │
│ - id        │
│ - name      │
│ - date      │
│ - dj_id     │
│ - venue_*   │
└─────────────┘
       │
       │ (Relationships)
       │
   ┌───┴────┬──────────┬──────────┬──────────┐
   │        │          │          │          │
   ▼(1:1)   ▼(1:1)     ▼(1:many)  ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│EVENT_   │ │EVENT_   │ │EVENT_   │ │ FUTURE  │
│PLANNING │ │MUSIC_   │ │DOCUMENTS│ │ TABLES  │
│         │ │IDEAS    │ │         │ │         │
│- JSON   │ │- JSON   │ │- files  │ │         │
│- notes  │ │- notes  │ │- parsed │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### **Relationship Details:**
- **Users (1) → Events (Many)**: One DJ can have multiple events
- **Events (1) → Event_Planning (1)**: One event has one planning data record
- **Events (1) → Event_Music_Ideas (1)**: One event has one music ideas record
- **Events (1) → Event_Documents (Many)**: One event can have multiple documents
- **Users (1) → Event_Documents (Many)**: One user can upload multiple documents

## **Laravel Model Relationships**

### **Event Model:**
```php
public function dj()
{
    return $this->belongsTo(User::class, 'dj_id');
}

public function planning()
{
    return $this->hasOne(EventPlanning::class);
}

public function musicIdeas()
{
    return $this->hasOne(EventMusicIdeas::class);
}

public function documents()
{
    return $this->hasMany(EventDocument::class);
}
```

### **User Model:**
```php
public function events()
{
    return $this->hasMany(Event::class, 'dj_id');
}

public function uploadedDocuments()
{
    return $this->hasMany(EventDocument::class, 'uploaded_by');
}
```

### **EventPlanning Model:**
```php
public function event()
{
    return $this->belongsTo(Event::class);
}
```

### **EventMusicIdeas Model:**
```php
public function event()
{
    return $this->belongsTo(Event::class);
}
```

### **EventDocument Model:**
```php
public function event()
{
    return $this->belongsTo(Event::class);
}

public function uploadedBy()
{
    return $this->belongsTo(User::class, 'uploaded_by');
}
```

## **Key Design Benefits**

### **1. Clean Separation of Concerns**
- Each major data type has its own table
- JSON storage provides flexibility within structured relationships
- Clear one-to-one relationships for planning and music data

### **2. Scalability**
- Easy to add new event-related tables in the future
- JSON structure allows for dynamic fields without schema changes
- Foreign key constraints maintain data integrity

### **3. Performance**
- One-to-one relationships reduce joins
- JSON indexing available in modern MySQL versions
- Efficient querying for event-centric operations

### **4. Flexibility**
- JSON structure allows for different planning forms per event type
- Music ideas can accommodate various input methods (individual songs, playlists)
- Document storage supports multiple file types and parsing results

## **Migration Order**
1. Update users table (add new fields)
2. Keep events table as-is (already created)
3. Drop old event_planning_data and event_music tables
4. Create new event_planning table
5. Rename event_music to event_music_ideas and update structure
6. Keep event_documents table as-is

This design provides a solid foundation for the DJ Wedding Planning application with room for future enhancements while maintaining clean, efficient data relationships.
