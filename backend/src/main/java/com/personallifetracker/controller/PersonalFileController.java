package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.PersonalFile;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.PersonalFileRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/personal-files")
public class PersonalFileController {

    private final PersonalFileRepository fileRepository;
    private final UserRepository userRepository;

    public PersonalFileController(PersonalFileRepository fileRepository, UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PersonalFile>>> getFiles(Authentication authentication) {
        // Return file records without the byte content to keep response small
        List<PersonalFile> files = fileRepository.findAllByUserId(getUserId(authentication));
        files.forEach(f -> f.setContent(null));
        return ResponseEntity.ok(ApiResponse.success(files));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PersonalFile>> uploadFile(Authentication authentication, @RequestParam("file") MultipartFile file) throws IOException {
        PersonalFile personalFile = PersonalFile.builder()
                .userId(getUserId(authentication))
                .filename(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .content(file.getBytes())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(fileRepository.save(personalFile)));
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<byte[]> viewFile(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return fileRepository.findById(id)
                .filter(f -> f.getUserId().equals(userId))
                .map(f -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(f.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + f.getFilename() + "\"")
                        .body(f.getContent()))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return fileRepository.findById(id)
                .filter(f -> f.getUserId().equals(userId))
                .map(f -> {
                    fileRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
