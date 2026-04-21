package com.personallifetracker.storage;

import com.personallifetracker.entity.*;
import lombok.Getter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Getter
public class InMemoryStorage {

    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<Long, User> usersById = new ConcurrentHashMap<>();
    private final Map<Long, Task> tasks = new ConcurrentHashMap<>();
    private final Map<Long, Goal> goals = new ConcurrentHashMap<>();
    private final Map<Long, FinanceTransaction> transactions = new ConcurrentHashMap<>();
    private final Map<Long, Habit> habits = new ConcurrentHashMap<>();
    private final Map<Long, JournalEntry> journalEntries = new ConcurrentHashMap<>();
    private final Map<Long, OfficeAttendance> officeAttendances = new ConcurrentHashMap<>();
    private final Map<Long, OfficeSummary> officeSummaries = new ConcurrentHashMap<>();
    private final Map<Long, PersonalFile> personalFiles = new ConcurrentHashMap<>();
    private final Map<Long, HabitLog> habitLogs = new ConcurrentHashMap<>();
    private final Map<String, PasswordResetToken> passwordResetTokens = new ConcurrentHashMap<>();
    private final Map<Long, PasswordEntry> passwordEntries = new ConcurrentHashMap<>();
    
    private final AtomicLong userIdGenerator = new AtomicLong(1);
    private final AtomicLong taskIdGenerator = new AtomicLong(1);
    private final AtomicLong goalIdGenerator = new AtomicLong(1);
    private final AtomicLong transactionIdGenerator = new AtomicLong(1);
    private final AtomicLong habitIdGenerator = new AtomicLong(1);
    private final AtomicLong journalIdGenerator = new AtomicLong(1);
    private final AtomicLong attendanceIdGenerator = new AtomicLong(1);
    private final AtomicLong summaryIdGenerator = new AtomicLong(1);
    private final AtomicLong fileIdGenerator = new AtomicLong(1);
    private final AtomicLong habitLogIdGenerator = new AtomicLong(1);
    private final AtomicLong passwordEntryIdGenerator = new AtomicLong(1);

    private final PasswordEncoder passwordEncoder;
    
    public InMemoryStorage(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        // Pre-seed the static user
        User staticUser = new User();
        staticUser.setId(userIdGenerator.getAndIncrement());
        staticUser.setEmail("anandth107@gmail.com");
        // Hash for "Anandth@careertrack-04"
        staticUser.setPassword(passwordEncoder.encode("Anandth@careertrack-04"));
        staticUser.setFirstName("Anandaraj");
        staticUser.setLastName("P");
        staticUser.setRole("ADMIN");
        staticUser.setBio("Lead developer and system administrator.");
        staticUser.setPhone("+91 ");
        staticUser.setProfileImageUrl("/api/v1/users/profile/image/1");
        
        // Seed default profile image content
        try {
            java.net.URL url = new java.net.URL("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop");
            java.io.InputStream is = url.openStream();
            staticUser.setProfileImageContent(is.readAllBytes());
            staticUser.setProfileImageContentType("image/jpeg");
            is.close();
        } catch (Exception e) {
            System.err.println("Failed to seed default profile image, using fallback: " + e.getMessage());
            // Fallback to a tiny 1x1 transparent pixel or a simple colored dot if needed
            // But the UserController now redirects to ui-avatars, so we can just leave it null
            // and let the redirect handle it.
        }
            
        saveUser(staticUser);
    }

    public void saveUser(User user) {
        if (user.getId() == null) {
            user.setId(userIdGenerator.getAndIncrement());
        }
        usersByEmail.put(user.getEmail(), user);
        usersById.put(user.getId(), user);
    }

    public void clearData(String email) {
        User user = usersByEmail.get(email);
        if (user != null) {
            Long userId = user.getId();
            tasks.values().removeIf(t -> t.getUserId().equals(userId));
            goals.values().removeIf(g -> g.getUserId().equals(userId));
            transactions.values().removeIf(tr -> tr.getUserId().equals(userId));
            habits.values().removeIf(h -> h.getUserId().equals(userId));
            journalEntries.values().removeIf(j -> j.getUserId().equals(userId));
            officeAttendances.values().removeIf(oa -> oa.getUserId().equals(userId));
            officeSummaries.values().removeIf(os -> os.getUserId().equals(userId));
            personalFiles.values().removeIf(pf -> pf.getUserId().equals(userId));
            
            // Clear habit logs for habits belonging to this user
            List<Long> userHabitIds = habits.values().stream()
                .filter(h -> h.getUserId().equals(userId))
                .map(Habit::getId)
                .toList();
            habitLogs.values().removeIf(hl -> userHabitIds.contains(hl.getHabitId()));
            
            // Trigger GC explicitly as requested (though not guaranteed in Java, it signals intent)
            System.gc();
        }
    }
}
