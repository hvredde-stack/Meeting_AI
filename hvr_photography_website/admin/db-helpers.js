// Database Helper Functions for Firebase Firestore

// ===== CUSTOMERS =====

async function getAllCustomers() {
    try {
        const snapshot = await db.collection('customers').orderBy('engagement.lastContact', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting customers:', error);
        return [];
    }
}

async function getCustomer(customerId) {
    try {
        const doc = await db.collection('customers').doc(customerId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error('Error getting customer:', error);
        return null;
    }
}

async function addCustomer(customerData) {
    try {
        const docRef = await db.collection('customers').add({
            ...customerData,
            engagement: {
                ...customerData.engagement,
                firstContact: firebase.firestore.FieldValue.serverTimestamp(),
                lastContact: firebase.firestore.FieldValue.serverTimestamp()
            }
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
}

async function updateCustomer(customerId, updates) {
    try {
        await db.collection('customers').doc(customerId).update({
            ...updates,
            'engagement.lastContact': firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
}

async function deleteCustomer(customerId) {
    try {
        await db.collection('customers').doc(customerId).delete();
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
}

async function searchCustomers(query) {
    try {
        const snapshot = await db.collection('customers').get();
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return customers.filter(customer => {
            const searchText = query.toLowerCase();
            return (
                customer.personalInfo.name.toLowerCase().includes(searchText) ||
                customer.personalInfo.email.toLowerCase().includes(searchText) ||
                customer.personalInfo.phone.includes(searchText)
            );
        });
    } catch (error) {
        console.error('Error searching customers:', error);
        return [];
    }
}

// ===== PROJECTS =====

async function getAllProjects() {
    try {
        const snapshot = await db.collection('projects').orderBy('projectInfo.createdDate', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

async function getProject(projectId) {
    try {
        const doc = await db.collection('projects').doc(projectId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error('Error getting project:', error);
        return null;
    }
}

async function getCustomerProjects(customerId) {
    try {
        const snapshot = await db.collection('projects')
            .where('customerId', '==', customerId)
            .orderBy('projectInfo.createdDate', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting customer projects:', error);
        return [];
    }
}

async function addProject(projectData) {
    try {
        const docRef = await db.collection('projects').add({
            ...projectData,
            projectInfo: {
                ...projectData.projectInfo,
                createdDate: firebase.firestore.FieldValue.serverTimestamp()
            },
            timeline: [
                {
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    event: 'Project created',
                    user: 'Admin'
                }
            ]
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding project:', error);
        throw error;
    }
}

async function updateProject(projectId, updates) {
    try {
        await db.collection('projects').doc(projectId).update(updates);
        return true;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function updateProjectStatus(projectId, newStatus, user = 'Admin') {
    try {
        const project = await getProject(projectId);
        const timeline = project.timeline || [];

        timeline.push({
            date: firebase.firestore.FieldValue.serverTimestamp(),
            event: `Status changed to ${newStatus}`,
            user: user
        });

        await db.collection('projects').doc(projectId).update({
            'projectInfo.status': newStatus,
            timeline: timeline
        });

        return true;
    } catch (error) {
        console.error('Error updating project status:', error);
        throw error;
    }
}

async function addProjectNote(projectId, note, user = 'Admin') {
    try {
        const project = await getProject(projectId);
        const timeline = project.timeline || [];

        timeline.push({
            date: firebase.firestore.FieldValue.serverTimestamp(),
            event: `Note added: ${note}`,
            user: user
        });

        await db.collection('projects').doc(projectId).update({
            timeline: timeline
        });

        return true;
    } catch (error) {
        console.error('Error adding project note:', error);
        throw error;
    }
}

// ===== INQUIRIES =====

async function getAllInquiries() {
    try {
        const snapshot = await db.collection('inquiries').orderBy('timestamp', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting inquiries:', error);
        return [];
    }
}

async function getUnreadInquiries() {
    try {
        const snapshot = await db.collection('inquiries')
            .where('status', '==', 'new')
            .orderBy('timestamp', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting unread inquiries:', error);
        return [];
    }
}

async function markInquiryAsRead(inquiryId) {
    try {
        await db.collection('inquiries').doc(inquiryId).update({
            status: 'read',
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error marking inquiry as read:', error);
        throw error;
    }
}

// ===== BOOKINGS =====

async function getAllBookings() {
    try {
        const snapshot = await db.collection('bookings').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting bookings:', error);
        return [];
    }
}

async function getUpcomingBookings() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const snapshot = await db.collection('bookings')
            .where('date', '>=', today.toISOString().split('T')[0])
            .where('status', '==', 'confirmed')
            .orderBy('date', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting upcoming bookings:', error);
        return [];
    }
}

async function updateBookingStatus(bookingId, newStatus) {
    try {
        await db.collection('bookings').doc(bookingId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
}

// ===== QUOTES =====

async function getAllQuotes() {
    try {
        const snapshot = await db.collection('quotes').orderBy('timestamp', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting quotes:', error);
        return [];
    }
}

async function getPendingQuotes() {
    try {
        const snapshot = await db.collection('quotes')
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting pending quotes:', error);
        return [];
    }
}

// ===== ANALYTICS =====

async function logPageView(page) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const docRef = db.collection('analytics').doc(today);

        await docRef.set({
            pageViews: firebase.firestore.FieldValue.increment(1),
            [`pages.${page}`]: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });

        return true;
    } catch (error) {
        console.error('Error logging page view:', error);
        return false;
    }
}

async function logConversion(type) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const docRef = db.collection('analytics').doc(today);

        await docRef.set({
            conversions: firebase.firestore.FieldValue.increment(1),
            [`conversionTypes.${type}`]: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });

        return true;
    } catch (error) {
        console.error('Error logging conversion:', error);
        return false;
    }
}

async function getAnalytics(startDate, endDate) {
    try {
        const snapshot = await db.collection('analytics')
            .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
            .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting analytics:', error);
        return [];
    }
}

// ===== COUPONS =====

async function validateCoupon(code) {
    try {
        const doc = await db.collection('coupons').doc(code.toUpperCase()).get();

        if (!doc.exists) {
            return { valid: false, message: 'Invalid coupon code' };
        }

        const coupon = doc.data();
        const today = new Date().toISOString().split('T')[0];

        if (coupon.validFrom > today) {
            return { valid: false, message: 'Coupon not yet valid' };
        }

        if (coupon.validUntil < today) {
            return { valid: false, message: 'Coupon has expired' };
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return { valid: false, message: 'Coupon usage limit reached' };
        }

        return { valid: true, coupon: coupon };
    } catch (error) {
        console.error('Error validating coupon:', error);
        return { valid: false, message: 'Error validating coupon' };
    }
}

async function useCoupon(code) {
    try {
        await db.collection('coupons').doc(code.toUpperCase()).update({
            usedCount: firebase.firestore.FieldValue.increment(1)
        });
        return true;
    } catch (error) {
        console.error('Error using coupon:', error);
        throw error;
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Customers
        getAllCustomers,
        getCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        searchCustomers,
        // Projects
        getAllProjects,
        getProject,
        getCustomerProjects,
        addProject,
        updateProject,
        updateProjectStatus,
        addProjectNote,
        // Inquiries
        getAllInquiries,
        getUnreadInquiries,
        markInquiryAsRead,
        // Bookings
        getAllBookings,
        getUpcomingBookings,
        updateBookingStatus,
        // Quotes
        getAllQuotes,
        getPendingQuotes,
        // Analytics
        logPageView,
        logConversion,
        getAnalytics,
        // Coupons
        validateCoupon,
        useCoupon
    };
}
