package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String profileImageUrl;
    private String role;
    private String bio;
    private String phone;
    private String timezone;
    private byte[] profileImageContent;
    private String profileImageContentType;
    @Builder.Default
    private boolean enabled = true;
}
