import { NdmaProtocolPhase } from '../types';

export const NDMA_PROTOCOLS: NdmaProtocolPhase[] = [
  {
    id: 'proto-1',
    phase: '1',
    title: 'Pre-Monsoon & Early Warning SOPs',
    description: 'Comprehensive risk zone classification, retaining wall inspection, and community warning dissemination framework.',
    steps: [
      'Know your local geohazard risk zone (Zone III, IV, or V). Use local official disaster-management channels for alerts.',
      'Inspect retaining walls and stormwater drainage ditches around properties; clear debris, silt, and fallen branches.',
      'Watch for warning signs: sticking doors/windows, new cracks in plaster or foundations, tilted trees or telephone posts.',
      'Prepare an Emergency Go-Bag containing non-perishable rations, water purifying tablets, first-aid kit, whistle, waterproof torch, and certified identity documents.',
      'Identify designated elevated community shelters and two alternative evacuation corridors away from known gully drainage paths.'
    ]
  },
  {
    id: 'proto-2',
    phase: '2',
    title: 'Emergency Early Warning Dissemination',
    description: 'Rapid multi-modal transmission of Common Alerting Protocol (CAP) messages across cellular and radio networks.',
    steps: [
      'Escalate to local authorities when official weather warnings and observed slope conditions indicate danger.',
      'Use authorized public-warning channels available to the responsible authorities.',
      'Coordinate public information through verified local emergency communication channels.',
      'Maintain clear communication between district administration and emergency operations teams.'
    ]
  },
  {
    id: 'proto-3',
    phase: '3',
    title: 'Active Evacuation & Search Rescue Protocols',
    description: 'Standard operating procedures during imminent slope failure and mass movement.',
    steps: [
      'If you hear unusual rumbling sounds, trees cracking, or see sudden muddy water gushes, evacuate immediately.',
      'Never attempt to cross a roadway covered with fresh mud, fallen boulders, or moving water.',
      'Move quickly to stable bedrock ground perpendicular to the path of the landslide debris chute.',
      'Mobilize National Disaster Response Force (NDRF) and State Disaster Response Force (SDRF) units with earthmoving equipment.'
    ]
  },
  {
    id: 'proto-4',
    phase: '4',
    title: 'Post-Event Rehabilitation & Engineering Audit',
    description: 'Site safety verification, secondary hazard audit, and public infrastructure restoration.',
    steps: [
      'Stay away from the slide area. Secondary and tertiary collapses often follow within 24–48 hours.',
      'Report broken utility lines, severed power lines, or ruptured water pipes immediately to district engineering officers.',
      'Do not consume open well or stream water until tested, as aquifers undergo heavy silt contamination post-failure.',
      'Submit geo-tagged field observations through the Bhoomi Rakshak citizen reporting portal to assist geological mapping.'
    ]
  }
];
