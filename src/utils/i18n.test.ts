import {describe,it,expect} from 'vitest';
import {translate} from './i18n';
import {initialPlayer,parsePlayer} from '../state/store';
describe('language preferences',()=>{
 it('defaults to English and restores old saves without a language field',()=>{const p=initialPlayer();expect(p.settings.language).toBe('en');const raw=JSON.parse(JSON.stringify(p));delete raw.settings.language;expect(parsePlayer(JSON.stringify(raw)).settings.language).toBe('en');});
 it('roundtrips Italian and rejects unsupported languages',()=>{const p=initialPlayer();p.settings.language='it';expect(parsePlayer(JSON.stringify(p)).settings.language).toBe('it');expect(()=>parsePlayer(JSON.stringify({...p,settings:{...p.settings,language:'fr'}}))).toThrow();});
 it('translates controls and dynamic ball counts while preserving English',()=>{expect(translate('Settings','en')).toBe('Settings');expect(translate('Settings','it')).toBe('Impostazioni');expect(translate('Drop a ball','it')).toBe('Lancia una pallina');expect(translate('3 balls in flight · drop another anytime','it')).toContain('3 palline');expect(translate('LUCKYVOID','it')).toBe('LUCKYVOID');});
});
