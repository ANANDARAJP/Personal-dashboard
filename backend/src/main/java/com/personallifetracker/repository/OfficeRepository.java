package com.personallifetracker.repository;

import com.personallifetracker.entity.OfficeAttendance;
import com.personallifetracker.entity.OfficeSummary;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class OfficeRepository {
    private final InMemoryStorage storage;

    public OfficeRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public Optional<OfficeAttendance> findAttendanceByUserIdAndDate(Long userId, LocalDate date) {
        return storage.getOfficeAttendances().values().stream()
                .filter(a -> a.getUserId().equals(userId) && date.equals(a.getDate()))
                .findFirst();
    }

    public List<OfficeAttendance> findAttendanceHistory(Long userId) {
        return storage.getOfficeAttendances().values().stream()
                .filter(a -> a.getUserId().equals(userId))
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

    public OfficeAttendance saveAttendance(OfficeAttendance attendance) {
        if (attendance.getId() == null) {
            attendance.setId(storage.getAttendanceIdGenerator().getAndIncrement());
        }
        storage.getOfficeAttendances().put(attendance.getId(), attendance);
        return attendance;
    }

    public Optional<OfficeSummary> findSummaryByUserIdAndDate(Long userId, LocalDate date) {
        return storage.getOfficeSummaries().values().stream()
                .filter(s -> s.getUserId().equals(userId) && date.equals(s.getDate()))
                .findFirst();
    }

    public OfficeSummary saveSummary(OfficeSummary summary) {
        if (summary.getId() == null) {
            summary.setId(storage.getSummaryIdGenerator().getAndIncrement());
        }
        storage.getOfficeSummaries().put(summary.getId(), summary);
        return summary;
    }
}
