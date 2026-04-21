package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalFile {
    private Long id;
    private Long userId;
    private String filename;
    private String fileType;
    private long fileSize;
    private byte[] content;
    private LocalDateTime createdAt;
}
