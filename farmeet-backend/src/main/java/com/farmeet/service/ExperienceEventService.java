package com.farmeet.service;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.repository.ExperienceEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExperienceEventService {

    @Autowired
    private ExperienceEventRepository eventRepository;

    public List<ExperienceEvent> getAllEvents() {
        return eventRepository.findAll();
    }

    public ExperienceEvent getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<ExperienceEvent> getEventsByFarm(Long farmId) {
        return eventRepository.findByFarmId(farmId);
    }

    public ExperienceEvent createEvent(ExperienceEvent event) {
        return eventRepository.save(event);
    }
}
