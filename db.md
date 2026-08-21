# SettleMate Database Reference

Generated from `prisma/schema.prisma` (MySQL). This is documentation only — the schema file is the source of truth.

> **Note:** Status and type fields are stored as plain strings. Valid values are listed with each table.

# users
- id (Int, PK, autoincrement)
- email (String?, unique)
- phone (String?, unique)
- passwordHash (String?)

## Privileges (unified login, independent booleans)
- isAdmin (Boolean, default false)
- isOwner (Boolean, default false)
- isProvider (Boolean, default false)

## Account
- status (PENDING | VERIFIED | BLOCKED, default PENDING)
- name (String?)
- avatar (String?)
- dateOfBirth (DateTime?)
- gender (String?)
- occupation (String?)

## KYC
- aadhaarVerified (Boolean, default false)
- panVerified (Boolean, default false)
- kycDocuments (String, default "[]" — JSON array of { documentType, documentNumber, documentImage, submittedAt })

## Trust & Security
- trustScore (Float, default 0)
- lastLoginAt (DateTime?)
- loginAttempts (Int, default 0)
- lockedUntil (DateTime?)

## OAuth
- oauthProvider (String?)
- oauthId (String?)

## Timestamps
- createdAt
- updatedAt

Relations: refreshTokens, otpCodes, auditLogs, houses, bookings, flatmateProfile, agreements (tenant), ownerAgreements, payments, serviceListings, serviceBookings, reviewsWritten, reviewsReceived, messages

Indexes: email, phone, [isAdmin+status], [isOwner+status], [isProvider+status]

# refresh_tokens
- id (Int, PK)
- token (String, unique)
- userId → users.id (cascade delete)
- deviceInfo (String?)
- ipAddress (String?)
- expiresAt (DateTime)
- createdAt
- revokedAt (DateTime?)

Index: userId

# otp_codes
- id (Int, PK)
- code (String)
- phone (String)
- purpose (LOGIN | REGISTRATION | PASSWORD_RESET | AGREEMENT_SIGN)
- userId → users.id? (cascade delete)
- attempts (Int, default 0)
- verified (Boolean, default false)
- expiresAt (DateTime)
- createdAt

Indexes: [phone+purpose], [code+phone]

# audit_logs
- id (Int, PK)
- userId → users.id (cascade delete)
- action (String)
- resource (String)
- details (String? — JSON string)
- ipAddress (String?)
- userAgent (String?)
- createdAt

Indexes: userId, action, createdAt

# houses
- id (Int, PK)
- ownerId → users.id (cascade delete)

## Basic Information
- title (String)
- description (String?)
- type (APARTMENT | INDEPENDENT_HOUSE | VILLA)

## Address
- addressLine1 (String)
- addressLine2 (String?)
- city (String)
- state (String)
- pincode (String)
- latitude (Float?)
- longitude (Float?)

## Pricing
- rent (Int — monthly rent in smallest currency unit)
- deposit (Int)
- maintenanceCharges (Int?)

## Property Details
- bedrooms (Int, default 1)
- bathrooms (Int, default 1)
- area (Int? — square feet)
- floor (Int?)
- totalFloors (Int?)

## Features
- furnishing (FURNISHED | SEMI_FURNISHED | UNFURNISHED, default UNFURNISHED)
- amenities (String, default "[]" — JSON array)
- images (String, default "[]" — JSON array)

## Preferences
- preferredTenants (String, default "[]" — JSON array e.g. ["family","bachelor"])
- petsAllowed (Boolean, default false)

## Availability
- status (AVAILABLE | RENTED | INACTIVE | UNDER_MAINTENANCE, default AVAILABLE)
- availableFrom (DateTime, default now())

## Metrics
- viewCount (Int, default 0)
- inquiryCount (Int, default 0)

## Timestamps
- createdAt
- updatedAt

Relations: bookings, agreements, reviews

Indexes: ownerId, [city+status], rent, [type+furnishing], [status+availableFrom]

# bookings
- id (Int, PK)
- houseId → houses.id (cascade delete)
- userId → users.id (cascade delete, the tenant)
- status (REQUESTED | ACCEPTED | REJECTED | CANCELLED, default REQUESTED)
- message (String?)
- checkInDate (DateTime?)
- checkOutDate (DateTime?)
- createdAt
- updatedAt

Relations: agreements, payments

Indexes: houseId, userId

# flatmate_profiles
- id (Int, PK)
- userId → users.id (unique, cascade delete)
- budget (Int — max budget)
- lifestyle (String, default "[]" — JSON array e.g. ["smoker", "non-vegetarian"])
- lookingFor (String, default "[]" — JSON array of desired roommate traits)
- occupation (String?)
- bio (String?)
- moveInDate (DateTime?)

## Location preferences
- city (String?)
- state (String?)
- preferredLocation (String? — specific area or neighborhood)

## Timestamps
- createdAt
- updatedAt

# agreements
- id (Int, PK)
- bookingId → bookings.id (cascade delete)
- tenantId → users.id ("TenantAgreements")
- ownerId → users.id ("OwnerAgreements")
- houseId → houses.id (NoAction on delete)
- status (DRAFT | SIGNED | ACTIVE | EXPIRED, default DRAFT)
- documentUrl (String? — PDF link)
- rentAmount (Int)
- depositAmount (Int)
- startDate (DateTime)
- endDate (DateTime)
- terms (String? — JSON string or plain text)
- createdAt
- updatedAt

Indexes: bookingId, tenantId, ownerId

# payments
- id (Int, PK)
- userId → users.id
- type (RENT | DEPOSIT | SERVICE | PLATFORM_FEE)
- amount (Int)
- currency (String, default "INR")
- status (PENDING | SUCCESS | FAILED, default PENDING)
- providerId (String? — e.g. Razorpay Order ID)
- paymentId (String? — e.g. Razorpay Payment ID)
- bookingId → bookings.id?
- serviceBookingId → service_bookings.id?
- createdAt
- updatedAt

Indexes: userId, providerId

# service_providers
- id (Int, PK)
- providerId → users.id (cascade delete)
- type (MAID | COOK | LAUNDRY | FURNITURE | APPLIANCE)
- title (String)
- description (String?)
- price (Int)
- pricingModel (PER_MONTH | PER_JOB | ONE_TIME, default PER_MONTH)
- images (String, default "[]" — JSON array)
- city (String?)
- state (String?)
- status (PENDING | APPROVED | REJECTED, default PENDING)
- rejectionReason (String? — reason if rejected)
- createdAt
- updatedAt

Relations: bookings (ServiceBooking[]), reviews

Indexes: providerId, status

# service_bookings
- id (Int, PK)
- userId → users.id (cascade delete)
- listingId → service_providers.id
- status (REQUESTED | ACCEPTED | COMPLETED | CANCELLED, default REQUESTED)
- startDate (DateTime?)
- endDate (DateTime?)
- totalAmount (Int)
- createdAt
- updatedAt

Relations: payments

Indexes: userId, listingId

# messages
- id (Int, PK)
- senderId → users.id
- roomId (String — convention: "chat-user1-user2" or flatmate group ID)
- content (String)
- isRead (Boolean, default false)
- createdAt

Indexes: roomId, senderId

# reviews
- id (Int, PK)
- authorId → users.id ("AuthoredReviews")
- targetUserId → users.id? ("TargetUserReviews")
- houseId → houses.id?
- serviceId → service_providers.id?
- rating (Int — 1-5 scale)
- comment (String?)
- createdAt
- updatedAt

Indexes: targetUserId, houseId, serviceId
