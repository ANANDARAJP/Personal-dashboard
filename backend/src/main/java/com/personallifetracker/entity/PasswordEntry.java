package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordEntry {
    private Long id;
    private Long userId;
    private String siteName;
    private String siteUrl;
    private String username;
    private String password;
    private String notes;
}
