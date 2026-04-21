package com.personallifetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PersonallifetrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(PersonallifetrackerApplication.class, args);
	}

}
