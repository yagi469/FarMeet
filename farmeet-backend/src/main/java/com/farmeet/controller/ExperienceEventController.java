package com.farmeet.controller;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.service.ExperienceEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class ExperienceEventController {

    @Autowired
    private ExperienceEventService eventService;

    @GetMapping
    public ResponseEntity<List<ExperienceEvent>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperienceEvent> getEventById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.getEventById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<ExperienceEvent>> getEventsByFarm(@PathVariable Long farmId) {
        return ResponseEntity.ok(eventService.getEventsByFarm(farmId));
    }

    @PostMapping
    public ResponseEntity<ExperienceEvent> createEvent(@RequestBody ExperienceEvent event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }
}
